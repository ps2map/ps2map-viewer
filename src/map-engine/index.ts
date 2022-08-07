/// <reference path="./camera.ts" />
/// <reference path="./layer-manager.ts" />
/// <reference path="./types.ts" />

/** Details for the "ps2map_viewboxchanged" custom event. */
interface ViewBoxChangedEvent {
    viewBox: ViewBox;
}

class MapEngine {
    readonly viewport: HTMLDivElement;

    readonly camera: Camera;
    readonly renderer: MapRenderer;
    layers: LayerManager;

    protected _mapSize: Box = { width: 0, height: 0 };

    public allowPan = true;
    private _isPanning: boolean = false;

    constructor(viewport: HTMLDivElement) {
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.layers = new LayerManager(viewport, this._mapSize);

        this.camera = new Camera(
            this._mapSize,
            { width: viewport.clientWidth, height: viewport.clientHeight });
        this.renderer = new MapRenderer(this.camera, this.layers);

        const observer = new ResizeObserver(() => {
            const width = this.viewport.clientWidth;
            const height = this.viewport.clientHeight;
            this.camera.updateViewportSize(this._mapSize, { width, height });
            this.viewport.dispatchEvent(
                this._buildViewBoxChangedEvent(this.camera.viewBox()));
        });
        observer.observe(this.viewport);

        // Attach event listeners
        this.viewport.addEventListener(
            "wheel", this._onZoom.bind(this), { passive: false });
        this.viewport.addEventListener(
            "mousedown", this._mousePan.bind(this), { passive: true });
    }

    public getZoom(): number {
        return this.camera.zoom();
    }

    public getMapSize(): Box {
        return this._mapSize;
    }

    public setMapSize(mapSize: Readonly<Box>): void {
        if (mapSize === this._mapSize)
            return;
        // Discard all layers and recreate the layer manager
        this.layers.clear();
        this.layers = new LayerManager(this.viewport, mapSize);
        this.renderer.updateLayerManager(this.layers);
        // Update camera for new map size
        this.camera.updateViewportSize(mapSize, {
            width: this.viewport.clientWidth,
            height: this.viewport.clientHeight,
        });
        this._mapSize = mapSize;
    }

    /**
     * Convert a point from screen coordinates to map coordinates.
     *
     * Screen coordinates are positive, relative to the top-left corner of the
     * viewport, while map coordinates have their origin at the center of the
     * map, with positive values increasing towards the top-right.

     * @param screen Point in screen coordinates or mouse event
     * @returns Point in map coordinates.
     */
    public screenToMap(screen: Readonly<Point>): Point {
        const vp = this.viewport;
        // Calculate relative position of point in viewport
        const relX = (screen.x - vp.offsetLeft) / vp.clientWidth;
        const relY = (screen.y - vp.offsetTop) / vp.clientHeight;
        // Interpolate the relative position within the view box
        const box = this.camera.viewBox();
        const halfSize = this.layers.mapSize.height * 0.5;
        return {
            x: -halfSize + box.left + (box.right - box.left) * relX,
            // (1 - relY) takes care of the Y axis inversion
            y: -halfSize + box.bottom + (box.top - box.bottom) * (1 - relY),
        };
    }

    /**
     * Event callback for mouse-wheel zoom
     * @param evt Wheel event to process
     */
    private readonly _onZoom = rafDebounce((evt: WheelEvent) => {
        evt.preventDefault();
        // Only allow zoom interactions when pan is not active - this avoids
        // camera target sync issues
        if (this._isPanning) return;
        // Get the viewport-relative cursor position
        const view = this.viewport.getBoundingClientRect();
        const relX = (evt.clientX - view.left) / view.width;
        const relY = (evt.clientY - view.top) / view.height;
        // Update the camera target and view box
        this.camera.zoomTowards(evt.deltaY, { x: relX, y: relY });
        this._constrainMapTarget();
        this.renderer.redraw();
        this.viewport.dispatchEvent(
            this._buildViewBoxChangedEvent(this.camera.viewBox()));
    });

    /** Event callback for mouse map panning.
     * @param evtDown "mousedown" event starting the panning operation
     */
    private _mousePan(evtDown: MouseEvent): void {
        // Never allow RMB panning
        if (evtDown.button === 2)
            return;
        // Only allow LMB panning if unlocked
        if (!this.allowPan && evtDown.button === 0)
            return;
        this._setPanLock(true);

        const panStart = {
            x: this.camera.target.x,
            y: this.camera.target.y,
        };
        const zoom = this.camera.zoom();
        const startX = evtDown.clientX;
        const startY = evtDown.clientY;

        // Continuous "mousemove" callback
        const drag = rafDebounce((evtDrag: MouseEvent) => {
            this.camera.jumpTo({
                x: panStart.x - (evtDrag.clientX - startX) / zoom,
                y: panStart.y + (evtDrag.clientY - startY) / zoom,
            });
            this._constrainMapTarget();
            this.renderer.redraw();
            this.viewport.dispatchEvent(
                this._buildViewBoxChangedEvent(this.camera.viewBox()));
        });

        // Global "mouseup" callback
        const up = () => {
            this._setPanLock(false);
            this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
            this.layers.updateAll();
        };

        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, { passive: true });
    }

    /**
     * Constrain the camera target to lie within the map area.
     *
     * This avoids users moving the map out of frame, never to be seen again.
     */
    private _constrainMapTarget(): void {
        let targetX = this.camera.target.x;
        let targetY = this.camera.target.y;
        const mapSize = this.layers.mapSize;
        // Constrain pan limits
        if (targetX < 0) targetX = 0;
        if (targetX > mapSize.width) targetX = mapSize.width;
        if (targetY < 0) targetY = 0;
        if (targetY > mapSize.height) targetY = mapSize.height;
        // Update camera
        this.camera.target = { x: targetX, y: targetY };
    }

    /**
     * Enable or disable the pan lock flag.
     *
     * Pan lock prevents the map from being zoomed while panning.
     * @param locked Whether the pan lock is active (i.e. zoom is disabled)
     */
    private _setPanLock(locked: boolean): void {
        this._isPanning = locked;
        // Disable CSS transitions while panning
        this.layers.forEachLayer(layer => {
            const element = layer.element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        });
    }

    private _buildViewBoxChangedEvent(viewBox: ViewBox): CustomEvent<ViewBoxChangedEvent> {
        return new CustomEvent("ps2map_viewboxchanged", {
            detail: { viewBox }, bubbles: true, cancelable: true,
        });
    }
}
