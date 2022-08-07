/// <reference path="./camera.ts" />
/// <reference path="./layer-manager.ts" />
/// <reference path="./support.ts" />
/// <reference path="./types.ts" />

/**
 * Details for the "ps2map_viewboxchanged" custom event.
 */
interface ViewBoxChangedEvent {
    viewBox: ViewBox;
}

/**
 * Core map rendering controller.
 *
 * This class is the primary controller object for a given map instance. Add
 * map layers to a map renderer to display them.
 *
 * The map renderer is responsible for handling camera interactions and
 * dispatching redraw and occlusion requests to any layers added to it. The
 * user may not directly interact with added map layers (aside from aestetical
 * style options that do not cause layout shifts or geometry changes).
 */
class MapRenderer {
    /** User-provided viewport element. Everything happens within this. */
    readonly viewport: HTMLDivElement;
    public layerManager: LayerManager;

    private _camera: Camera;
    private _anchor: HTMLElement;

    public allowPan = true;
    private _isPanning: boolean = false;

    constructor(viewport: HTMLDivElement, mapSize: number) {
        // Set up DOM containers
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this._anchor = document.createElement("div");
        this.layerManager = new LayerManager(this._anchor, mapSize)
        this.viewport.appendChild(this._anchor);

        // Set up camera
        this._camera = new Camera(
            { // Map dimensions
                width: mapSize, height: mapSize
            },
            { // Viewport dimensions
                width: this.viewport.clientWidth,
                height: this.viewport.clientHeight,
            });

        this.setMapSize(mapSize);

        this._anchor.style.left = `${this.viewport.clientWidth * 0.5}px`;
        this._anchor.style.top = `${this.viewport.clientHeight * 0.5}px`;

        // Attach event listeners
        this.viewport.addEventListener("wheel", this._onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this._mousePan.bind(this), {
            passive: true
        });

        const obj = new ResizeObserver(() => {
            const width = this.viewport.clientWidth;
            const height = this.viewport.clientHeight;
            this._anchor.style.left = `${width * 0.5}px`;
            this._anchor.style.top = `${height * 0.5}px`;
            this._camera.updateViewportSize(
                { width: this.getMapSize(), height: this.getMapSize() },
                { width, height });
            this.viewport.dispatchEvent(
                this._buildViewBoxChangedEvent(this._camera.viewBox()));
        });
        obj.observe(this.viewport);
    }

    getCanvasContext(): CanvasRenderingContext2D | null {
        const layer = this.layerManager.getLayer<CanvasLayer>("canvas");
        if (layer === null)
            // TODO: Should this even be an error? Not all browsers support
            // canvas layers, this could just return null.
            throw new Error("No canvas layer found");
        const canvas = layer.element.firstElementChild as HTMLCanvasElement | null;
        if (!canvas)
            return null;
        return canvas.getContext("2d");
    }

    getViewBox(): Readonly<ViewBox> {
        return this._camera.viewBox();
    }

    getMapSize(): number {
        return this.layerManager.mapSize;
    }

    getZoom(): number {
        return this._camera.zoom();
    }

    /**
     * Jump to the closest valid camera position near the target.
     * @param target Map position to jump to
     */
    jumpTo(target: Point): void {
        this._camera.jumpTo(target);
        this._constrainMapTarget();
        this._redraw(this.getViewBox(), this._camera.zoom());
    }

    /**
     * Update the map size of the map renderer.
     *
     * This is only available after all map layers have been removed from the
     * map renderer.
     * @param value New map size to apply.
     */
    setMapSize(value: number): void {
        if (!this.layerManager.isEmpty())
            throw new Error("Cannot change map size while layers are present");
        this.layerManager = new LayerManager(this._anchor, value);
        // Create a new camera as zoom levels depend on map size
        this._camera = new Camera(
            { // Map dimensions
                width: value, height: value
            },
            { // Viewport dimensions
                width: this.viewport.clientWidth,
                height: this.viewport.clientHeight,
            });
    }

    /**
     * Convert a point from screen coordinates to map coordinates.
     * 
     * Screen coordinates are positive, relative to the top-left corner of the
     * viewport, while map coordinates have their origin at the center of the
     * map, with positive values increasing towards the top-right.
     * 
     * The passed screen coordinates may either be a single point or a
     * MouseEvent event object.
     * @param screen Point in screen coordinates or mouse event
     * @returns Point in map coordinates.
     */
    screenToMap(screen: MouseEvent | Readonly<Point>): Point {
        if (screen instanceof MouseEvent)
            screen = { x: screen.clientX, y: screen.clientY };
        const vp = this.viewport;
        // Calculate relative position of point in viewport
        const relX = (screen.x - vp.offsetLeft) / vp.clientWidth;
        const relY = (screen.y - vp.offsetTop) / vp.clientHeight;
        // Interpolate the relative position within the view box
        const box = this._camera.viewBox();
        const halfSize = this.layerManager.mapSize * 0.5;
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
    private _onZoom = Utils.rafDebounce((evt: WheelEvent) => {
        evt.preventDefault();
        // Only allow zoom interactions when pan is not active - this avoids
        // camera target sync issues
        if (this._isPanning) return;
        // Get the viewport-relative cursor position
        const view = this.viewport.getBoundingClientRect()
        const relX = Utils.clamp((evt.clientX - view.left) / view.width, 0.0, 1.0);
        const relY = Utils.clamp((evt.clientY - view.top) / view.height, 0.0, 1.0);
        // Update the camera target and view box
        this._camera.zoomTowards(evt.deltaY, { x: relX, y: relY });
        this._constrainMapTarget();
        this._redraw(this.getViewBox(), this._camera.zoom());
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
            x: this._camera.target.x,
            y: this._camera.target.y
        };
        const zoom = this._camera.zoom();
        const startX = evtDown.clientX;
        const startY = evtDown.clientY;

        // Continuous "mousemove" callback
        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            this._camera.jumpTo({
                x: panStart.x - (evtDrag.clientX - startX) / zoom,
                y: panStart.y + (evtDrag.clientY - startY) / zoom
            });
            this._constrainMapTarget();
            this._redraw(this.getViewBox(), zoom);
        });

        // Global "mouseup" callback
        const up = () => {
            this._setPanLock(false);
            this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
            this.layerManager.updateAll();
        };

        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, { passive: true });
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
        this.layerManager.forEachLayer(layer => {
            const element = layer.element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        });
    }

    /**
     * Repaint the map layers and any auxiliary callbacks.
     * @param viewBox View box to dispatch
     * @param zoom Zoom level to use
     */
    private _redraw(viewBox: ViewBox, zoom: number): void {
        // Apply new zoom level and schedule map layer updates
        this.layerManager.forEachLayer(layer => {
            layer.redraw(viewBox, zoom);
            layer.setRedrawArgs(viewBox, zoom);
        });
        this._anchor.dispatchEvent(
            this._buildViewBoxChangedEvent(viewBox));
    }

    /**
     * Constrain the camera target to lie within the map area.
     *
     * This avoids users moving the map out of frame, never to be seen again.
     */
    private _constrainMapTarget(): void {
        let targetX = this._camera.target.x;
        let targetY = this._camera.target.y;
        const mapSize = this.layerManager.mapSize;
        // Constrain pan limits
        if (targetX < 0) targetX = 0;
        if (targetX > mapSize) targetX = mapSize;
        if (targetY < 0) targetY = 0;
        if (targetY > mapSize) targetY = mapSize;
        // Update camera
        this._camera.target = {
            x: targetX,
            y: targetY
        };
    }

    private _buildViewBoxChangedEvent(viewBox: ViewBox): CustomEvent<ViewBoxChangedEvent> {
        return new CustomEvent("ps2map_viewboxchanged", {
            detail: { viewBox }, bubbles: true, cancelable: true,
        });
    }
}
