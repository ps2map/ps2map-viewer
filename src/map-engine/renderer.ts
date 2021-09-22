/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />
/// <reference path="./support.ts" />

class MapCamera {

    // Constants

    /** Maximum zoom level (10 CSS pixels per map pixel). */
    private readonly maxZoom: number = 10.0
    /** Zoom level step size (logarithmic scaling factor when zooming). */
    private readonly zoomStep: number = 1.5;

    // Derived and cached attributes

    /** Precalculated zoom levels available for the given map size. */
    private zoom: number[];
    private viewportHeight: number;
    private viewportWidth: number;

    // Camera state

    /** Current zoom level index within the `zoom` array. */
    private zoomIndex: number = -1;
    /**
     * Current target of the camera.
     * 
     * This is the map location the centre of the camera is pointing at.
     */
    target: Point;

    constructor(mapSize: number, viewportHeight: number, viewportWidth: number) {
        this.viewportHeight = viewportHeight;
        this.viewportWidth = viewportWidth;
        // Calculate zoom factors
        let zoom = this.maxZoom;
        this.zoom = [this.maxZoom];
        const stepInverse = 1 / this.zoomStep;
        while (mapSize * zoom > Math.min(viewportHeight, viewportWidth)) {
            zoom *= stepInverse;
            this.zoom.push(Utils.roundTo(zoom, 2));
        }
        // Initial zoom level
        this.zoomIndex = this.zoom.length - 1;
        // Initial camera position
        this.target = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };
    }

    /**
     * Increment or decrement the zoom level.
     *
     * If `direction` is zero, do nothing.
     * @param direction Direction to bump the zoom level in
     * @returns New zoom level
     */
    bumpZoomLevel(direction: number): number {
        let index = this.zoomIndex;
        // Bump zoom level
        if (direction == 0)
            return index;
        if (direction < 0)
            index--;
        else if (direction > 0)
            index++;
        // Limit zoom range
        if (index < 0)
            index = 0;
        else if (index >= this.zoom.length)
            index = this.zoom.length - 1;
        // Update zoom level
        this.zoomIndex = index;
        return this.zoom[index];
    }

    /**
     * Return the current zoom level of the camera.
     * @returns Current map scaling factor.
     */
    getZoom(): number {
        return this.zoom[this.zoomIndex];
    }

    /**
     * Convert a position on the camera screen to a location on the map.
     * 
     * Note that screen space uses the top left corner as the origin, while the
     * map uses the bottom left corner as its origin.
     * @param screenX Distance of the point from the left edge of the view
     * @param screenY Distance of the point from the top edge of the view
     * @returns The map location at the given screen position
     */
    screenSpaceToMapSpace(screenX: number, screenY: number): Point {
        // Calculate the relative offset from the centre (-0.5 through 0.5)
        const offsetX = (screenX - this.viewportWidth * 0.5) / this.viewportWidth;
        const offsetY = (screenY - this.viewportHeight * 0.5) / this.viewportHeight;
        console.log(offsetX, offsetY);
        // Return the camera target offset according to the current zoom level
        return {
            x: this.target.x + this.viewportWidth * offsetX * this.zoom[this.zoomIndex],
            y: this.target.y + this.viewportHeight * offsetY * this.zoom[this.zoomIndex]
        }
    }

    /**
     * Estimate the visible map are for a given map target.
     * @param target The camera target (i.e. centre of the client viewport)
     * @returns A new viewbox denoting the visible map area
     */
    viewboxFromTarget(target: Point): Box {
        // Calculate the lengths covered by the viewport in map units
        const viewboxWidth = this.viewportWidth / this.getZoom();
        const viewboxHeight = this.viewportHeight / this.getZoom();
        // Get viewbox coordinates
        return {
            top: target.y + viewboxHeight * 0.5,
            right: target.x + viewboxWidth * 0.5,
            bottom: target.y - viewboxHeight * 0.5,
            left: target.x - viewboxWidth * 0.5,
        };
    }
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
    private readonly anchor: HTMLDivElement;

    /** The base map size for the current map. */
    private mapSize: number = 1024;
    /** Collection of map layers added to the map renderer. */
    private layers: Map < string, MapLayer > = new Map();

    // Current map panning offset - TBD anbd merged into camera target
    private panOffsetX: number;
    private panOffsetY: number;

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
     * Add a new map layer to the.
     *
     * The map size of the layer must match the map renderer's.
     * @param layer Map layer to add.
     */
    addLayer(layer: MapLayer): void {
        if (layer.mapSize != this.mapSize)
            throw "Map layer size must match the map renderer's.";
        this.layers.set(layer.id, layer);
        this.anchor.appendChild(layer.element);
        layer.redraw(this.camera.viewboxFromTarget(
            this.camera.target), this.camera.getZoom());
    }

    /** Get the current map size of the map renderer.
     * @returns Current size of the map
     */
    getMapSize(): number {
        return this.mapSize;
    }

    /**
     * Update the map size of the map renderer.
     *
     * This is only available after all map layers have been removed from the
     * map renderer.
     * @param value New map size to apply.
     */
    setMapSize(value: number): void {
        if (this.layers.size > 0)
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
        evt.preventDefault(); // Prevent mouse scroll
        // Get new zoom level
        const newZoom = this.camera.bumpZoomLevel(evt.deltaY);

        // Calculate new camera target
        // TODO: The viewbox could also be cached in-between operations
        const currentViewbox = this.camera.viewboxFromTarget(this.camera.target);
        const newTarget: Point = {
            x: currentViewbox.left + (currentViewbox.right - currentViewbox.left) * 0.5,
            y: currentViewbox.bottom + (currentViewbox.top - currentViewbox.bottom) * 0.5,
        };

        // Calculate the viewbox for the new camera target
        const newViewbox = this.camera.viewboxFromTarget(newTarget);

        // Apply new zoom level and schedule map layer updates
        this.layers.forEach((layer) => {
            layer.redraw(newViewbox, newZoom);
        });

        // Invoke viewbox callbacks
        let i = this.viewboxCallbacks.length;
        while (i-- > 0)
            this.viewboxCallbacks[i](newViewbox);
    });

    /** Event callback for mouse map panning.
     * @param evtDown "mousedown" event starting the panning operation
     */
    private mousePan(evtDown: MouseEvent): void {
        // Cache the initial anchor offset relative to which the pan will occur
        const refX = this.panOffsetX;
        const refY = this.panOffsetY;
        // Initial cursor position
        const startX = evtDown.clientX;
        const startY = evtDown.clientY;
        // Continuous "mousemove" callback
        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            const deltaX = evtDrag.clientX - startX;
            const deltaY = evtDrag.clientY - startY;
            // Calculate and apply new layer anchor offset
            this.panOffsetX = refX + deltaX;
            this.panOffsetY = refY + deltaY;
            this.anchor.style.left = `${this.panOffsetX}px`;
            this.anchor.style.top = `${this.panOffsetY}px`;
        });
        // Global "mouseup" callback
        const up = () => {
            this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };
        // Add listeners
        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, {
            passive: true
        });
    }
}