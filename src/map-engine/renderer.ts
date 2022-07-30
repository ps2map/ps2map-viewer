/// <reference path="./camera.ts" />
/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />
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

    /** Helper element used to centre map layers in the viewport. */
    private readonly _anchor: HTMLDivElement;
    /** The base map size for the current map. */
    private _mapSize: number = 1024;
    /** Collection of map layers added to the map renderer. */
    private _layers: MapLayer[] = [];

    // Current map panning offset - TODO: maybe merge into camera target?
    private _panOffsetX: number;
    private _panOffsetY: number;
    private _isPanning: boolean = false;
    private _camera: Camera;

    public allowPan = true;

    constructor(viewport: HTMLDivElement, mapSize: number) {
        // Set up DOM containers
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this._anchor = document.createElement("div");
        this._anchor.classList.add("ps2map__anchor")
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

        this._panOffsetX = this.viewport.clientWidth * 0.5;
        this._panOffsetY = this.viewport.clientHeight * 0.5;
        this._anchor.style.left = `${this._panOffsetX}px`;
        this._anchor.style.top = `${this._panOffsetY}px`;

        // Attach event listeners
        this.viewport.addEventListener("wheel", this._onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this._mousePan.bind(this), {
            passive: true
        });
    }

    getViewBox(): Readonly<ViewBox> {
        return this._camera.currentViewBox();
    }

    getMapSize(): number {
        return this._mapSize;
    }

    getZoom(): number {
        return this._camera.getZoom();
    }

    /**
     * Add a new map layer to the map.
     *
     * The map size of the layer must match the map renderer's.
     * @param layer Map layer to add.
     */
    addLayer(layer: MapLayer): void {
        if (layer.mapSize !== this._mapSize)
            throw "Map layer size must match the map renderer's.";
        this._layers.push(layer);
        this._anchor.appendChild(layer.element);
        this._redraw(this.getViewBox(), this._camera.getZoom());
    }

    /**
     * Retrieve an existing layer by its unique ID.
     * @param id ID of the layer to retrieve
     * @returns Layer with the given name, or null if not found.
     */
    getLayer(id: string): MapLayer | undefined {
        for (const layer of this._layers)
            if (layer.id === id)
                return layer;
        return undefined;
    }

    clearLayers(): void {
        this._anchor.innerText = "";
        this._layers = [];
    }

    forEachLayer(callback: (layer: MapLayer) => void): void {
        let i = this._layers.length;
        while (i-- > 0)
            callback(this._layers[i]!);
    }

    /**
     * Jump to the closest valid camera position near the target.
     * @param target Map position to jump to
     */
    jumpTo(target: Point): void {
        this._camera.jumpTo(target);
        this._constrainMapTarget();
        this._redraw(this.getViewBox(), this._camera.getZoom());
    }

    /**
     * Update the map size of the map renderer.
     *
     * This is only available after all map layers have been removed from the
     * map renderer.
     * @param value New map size to apply.
     */
    setMapSize(value: number): void {
        if (this._layers.length > 0)
            throw "Remove all map layers before changing map size.";
        this._mapSize = value;
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
        this._redraw(this.getViewBox(), this._camera.getZoom());
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
        const zoom = this._camera.getZoom();
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
            this._layers.forEach(layer => layer.updateLayer());
        };

        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, {
            passive: true
        });
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
        let i = this._layers.length;
        while (i-- > 0) {
            const element = this._layers[i]!.element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        }
    }

    /**
     * Repaint the map layers and any auxiliary callbacks.
     * @param viewBox View box to dispatch
     * @param zoom Zoom level to use
     */
    private _redraw(viewBox: ViewBox, zoom: number): void {
        // Apply new zoom level and schedule map layer updates
        let i = this._layers.length;
        while (i-- > 0) {
            const layer = this._layers[i]!;
            layer.redraw(viewBox, zoom);
            layer.setRedrawArgs(viewBox, zoom);
        }
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
        // Constrain pan limits
        if (targetX < 0) targetX = 0;
        if (targetX > this._mapSize) targetX = this._mapSize;
        if (targetY < 0) targetY = 0;
        if (targetY > this._mapSize) targetY = this._mapSize;
        // Update camera
        this._camera.target = {
            x: targetX,
            y: targetY
        };
    }

    private _buildViewBoxChangedEvent(viewBox: ViewBox): CustomEvent<ViewBoxChangedEvent> {
        return new CustomEvent("ps2map_viewboxchanged", {
            detail: {
                viewBox: viewBox
            },
            bubbles: true,
            cancelable: true,
        });
    }
}
