/// <reference path="./camera.ts" />
/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />
/// <reference path="./support.ts" />
/// <reference path="./types.ts" />

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
    private readonly anchor: HTMLDivElement;

    /** The base map size for the current map. */
    private mapSize: number = 1024;
    /** Collection of map layers added to the map renderer. */
    private layers: MapLayer[] = [];

    // Current map panning offset - TBD anbd merged into camera target
    private panOffsetX: number;
    private panOffsetY: number;

    private isPanning: boolean = false;

    private camera: MapCamera;

    /** Additional callbacks to invoke when the map viewbox changes. */
    viewboxCallbacks: ((arg0: Box) => any)[] = [];

    constructor(viewport: HTMLDivElement, mapSize: number) {
        // Set up DOM containers
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.anchor = document.createElement("div");
        this.anchor.classList.add("ps2map__anchor")
        this.viewport.appendChild(this.anchor);

        this.setMapSize(mapSize);

        // Set up camera
        this.camera = new MapCamera(
            mapSize, this.viewport.clientHeight, this.viewport.clientWidth);

        this.panOffsetX = this.viewport.clientWidth * 0.5;
        this.panOffsetY = this.viewport.clientHeight * 0.5;
        this.anchor.style.left = `${this.panOffsetX}px`;
        this.anchor.style.top = `${this.panOffsetY}px`;

        // Attach event listeners
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this.mousePan.bind(this), {
            passive: true
        });
    }

    /**
     * Add a new map layer to the map.
     *
     * The map size of the layer must match the map renderer's.
     * @param layer Map layer to add.
     */
    addLayer(layer: MapLayer): void {
        if (layer.mapSize != this.mapSize)
            throw "Map layer size must match the map renderer's.";
        this.layers.push(layer);
        this.anchor.appendChild(layer.element);
        this.redraw(this.camera.getViewbox(), this.camera.getZoom());
    }

    /**
     * Retrieve an existing layer by its unique ID.
     * @param id ID of the layer to retrieve
     * @returns Layer with the given name, or null if not found.
     */
    getLayer(id: string): MapLayer | undefined {
        for (const layer of this.layers) {
            if (layer.id == id) {
                return layer;
            }
        }
        return undefined;
    }

    /** Get the current map size of the map renderer.
     * @returns Current size of the map
     */
    getMapSize(): number {
        return this.mapSize;
    }

    /**
     * Jump to the closest valid camera position near the target.
     * @param target Map position to jump to
     */
    jumpTo(target: Point): void {
        this.camera.target = target;
        this.constrainMapTarget();
        this.redraw(this.camera.getViewbox(), this.camera.getZoom());
    }

    /**
     * Update the map size of the map renderer.
     *
     * This is only available after all map layers have been removed from the
     * map renderer.
     * @param value New map size to apply.
     */
    setMapSize(value: number): void {
        if (this.layers.length > 0)
            throw "Remove all map layers before changing map size.";
        this.mapSize = value;
        // Create a new camera as zoom levels depend on map size
        this.camera = new MapCamera(
            value, this.viewport.clientHeight, this.viewport.clientWidth);
    }

    /**
     * Event callback for mouse-wheel zoom
     * @param evt Wheel event to process
     */
    private onZoom = Utils.rafDebounce((evt: WheelEvent) => {
        evt.preventDefault();
        // Only allow zoom interactions when pan is not active - this avoids
        // camera target sync issues
        if (this.isPanning) return;
        // Get the viewport-relative cursor position
        const view = this.viewport.getBoundingClientRect()
        const relX = Utils.clamp((evt.clientX - view.left) / view.width, 0.0, 1.0);
        const relY = Utils.clamp((evt.clientY - view.top) / view.height, 0.0, 1.0);
        // Update the camera target and viewbox
        this.camera.zoomTo(evt.deltaY, relX, relY);
        this.constrainMapTarget();
        this.redraw(this.camera.getViewbox(), this.camera.getZoom());
    });

    /** Event callback for mouse map panning.
     * @param evtDown "mousedown" event starting the panning operation
     */
    private mousePan(evtDown: MouseEvent): void {
        if (evtDown.button == 2)
            return;
        this.setPanLock(true);
        // Cache the initial anchor offset relative to which the pan will occur
        const refX = this.camera.target.x;
        const refY = this.camera.target.y;
        const zoom = this.camera.getZoom();
        // Initial cursor position
        const startX = evtDown.clientX;
        const startY = evtDown.clientY;
        // Continuous "mousemove" callback
        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            const deltaX = evtDrag.clientX - startX;
            const deltaY = evtDrag.clientY - startY;
            // Calculate and apply new layer anchor offset
            this.camera.target = {
                x: refX - deltaX / zoom,
                y: refY + deltaY / zoom
            };
            this.constrainMapTarget();
            this.redraw(this.camera.getViewbox(), zoom);
        });
        // Global "mouseup" callback
        const up = () => {
            this.setPanLock(false);
            this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };
        // Add listeners
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
    private setPanLock(locked: boolean): void {
        this.isPanning = locked;
        // Disable CSS transitions while panning
        let i = this.layers.length;
        while (i-- > 0) {
            const element = this.layers[i].element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        }
    }

    /**
     * Repaint the map layers and any auxiliary callbacks.
     * @param viewbox Viewbox to dispatch
     * @param zoom Zoom level to use
     */
    private redraw(viewbox: Box, zoom: number): void {
        // Apply new zoom level and schedule map layer updates
        let i = this.layers.length;
        while (i-- > 0) {
            const layer = this.layers[i];
            layer.redraw(viewbox, zoom);
            layer.setRedrawArgs(viewbox, zoom);
        }
        // Invoke viewbox callbacks
        i = this.viewboxCallbacks.length;
        while (i-- > 0)
            this.viewboxCallbacks[i](viewbox);
    }

    /**
     * Constrain the camera target to lie within the map area.
     *
     * This avoids users moving the map out of frame, never to be seen again.
     */
    private constrainMapTarget(): void {
        let targetX = this.camera.target.x;
        let targetY = this.camera.target.y;
        // Constrain pan limits
        if (targetX < 0) targetX = 0;
        if (targetX > this.mapSize) targetX = this.mapSize;
        if (targetY < 0) targetY = 0;
        if (targetY > this.mapSize) targetY = this.mapSize;
        // Update camera
        this.camera.target = {
            x: targetX,
            y: targetY
        };
    }
}