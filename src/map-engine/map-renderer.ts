/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />
/// <reference path="./support.ts" />

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
    /**
     * The base map size for the current map.
     *
     * This is used to calculate panning limits and offsets for the map layers.
     */
    private mapSize: number = 1024;
    /** Collection of map layers added to the map renderer. */
    private layers: Map < string, MapLayer > = new Map();

    /** Current map scale. */
    private scale: number = 0.0;

    /** Constant defining the number of zoom levels available. */
    private readonly numZoomLevels = 12;
    /** List of zoom levels calculated for the given viewport and map size. */
    private zoomLevels: number[] = [];
    /** Current zoom level. */
    private zoom: number = 0.0;

    // Current map panning offset - TBD
    private panOffsetX: number;
    private panOffsetY: number;

    /** Current camera target of the viewport. */
    private cameraTarget: Point;

    /** Additional callbacks to invoke when the map viewbox changes. */
    viewboxCallbacks: ((arg0: Box) => any)[] = [];

    constructor(viewport: HTMLDivElement, mapSize: number) {
        // Set up DOM containers
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.anchor = document.createElement("div");
        this.anchor.classList.add("ps2map__anchor")
        this.viewport.appendChild(this.anchor);

        // Set initial zoom level
        this.setMapSize(mapSize);

        // Centre map by default
        this.cameraTarget = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };
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
        layer.redraw(this.viewboxFromCameraTarget(this.cameraTarget, this.scale), this.scale);
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
        // Recalculate zoom levels as they are map-size relative
        this.zoomLevels = this.calculateZoomLevels();
        this.zoom = this.numZoomLevels - 1;
        this.scale = this.zoomLevels[this.zoom];
    }

    /**
     * Event callback for mouse-wheel zoom
     * @param evt Wheel event to process
     */
    private onZoom = rafDebounce((evt: WheelEvent) => {
        evt.preventDefault(); // Prevent mouse scroll
        // Update map scale
        const newScale = this.zoomLevels[this.bumpZoomLevel(evt.deltaY)];

        // Get viewport-relative cursor position
        const [relX, relY] = this.clientSpaceToViewportSpace(evt.clientX, evt.clientY);

        // Calculate new camera target
        // TODO: The viewbox could also be cached in-between operations
        const currentViewbox = this.viewboxFromCameraTarget(this.cameraTarget, this.scale);
        const newTarget: Point = {
            x: currentViewbox.left + (currentViewbox.right - currentViewbox.left) * relX,
            y: currentViewbox.bottom + (currentViewbox.top - currentViewbox.bottom) * relY,
        };

        // Calculate the viewbox for the new camera target
        const newViewbox = this.viewboxFromCameraTarget(newTarget, newScale);

        // Apply scale and schedule map layer updates
        this.scale = newScale;
        this.layers.forEach((layer) => {
            layer.redraw(newViewbox, newScale);
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
        const drag = rafDebounce((evtDrag: MouseEvent) => {
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

    /**
     * Calculate map scales for all zoom levels.
     *
     * This is specific to the current map and viewport size and must be
     * regenerated after either is altered.
     * @returns Array of map scales for all zoom levels.
     */
    private calculateZoomLevels(): number[] {
        const vportMetres = this.viewportSizeInMetres();
        // Lower scale limit: map barely fills the viewport
        const min_scale = this.mapSize / vportMetres;
        // Upper scale limit: 10 mm on the screen for every metre on the map
        const max_scale = 100 / vportMetres;
        // Calculate logarithmic step for N zoom levels
        const map_scale_step = Math.pow(Math.round(min_scale / max_scale / 50) *
            50, 1 / (this.numZoomLevels - 1))
        // Create a custom list of zoom levels based on these limits
        let scale = Math.floor(max_scale / 100) * 100;
        const zoomLevels: number[] = [scale];
        for (let i = 1; i < this.numZoomLevels; i++) {
            scale *= map_scale_step;
            zoomLevels.push(Math.round(scale / 200) * 200);
        }
        return zoomLevels;
    }

    /**
     * Estimate the size of the map viewport in metres.
     *
     * This assumes that a millimetre contains ~4 CSS pixels.
     * @returns Size of the viewport in real-world metres.
     */
    private viewportSizeInMetres(): number {
        // Calculation performed user shorter viewport edge
        // TODO: Use cached viewport size references
        const height = this.viewport.clientHeight;
        const width = this.viewport.clientWidth;
        return (height < width ? height : width) / 4000;
    }

    /**
     * Increment or decrement the zoom level.
     *
     * If `direction` is zero, do nothing.
     * @param direction Direction to bump the zoom level in
     * @returns New zoom level
     */
    private bumpZoomLevel(direction: number): number {
        let newZoom = this.zoom;
        // Bump zoom level
        if (direction == 0) return newZoom;
        if (direction < 0) newZoom--;
        else if (direction > 0) newZoom++;
        // Limit zoom range
        if (newZoom < 0) newZoom = 0;
        else if (newZoom >= this.numZoomLevels) newZoom = this.numZoomLevels - 1;
        // Update zoom level
        this.zoom = newZoom;
        return newZoom;
    }

    /**
     * Convert from CSS pixels to map metres
     * @param length Length in CSS pixels
     * @param scale Current map scale
     * @returns The same length in map metres
     */
    private cssPxToMetres(length: number, scale: number): number {
        return length / 4000 * scale;
    }

    /**
     * Estimate the visible map are for a given map target.
     * @param target The camera target (i.e. centre of the client viewport)
     * @param scale Map scale to use for calculation
     * @returns A new viewbox denoting the visible map area
     */
    private viewboxFromCameraTarget(target: Point, scale: number): Box {
        // TODO: Use cached viewport DOM values
        const viewportWidth = this.viewport.clientWidth;
        const viewportHeight = this.viewport.clientHeight;

        // Calculate the lengths covered by the viewport in map units
        const viewboxWidth = this.cssPxToMetres(viewportWidth, scale);
        const viewboxHeight = this.cssPxToMetres(viewportHeight, scale);
        // Get viewbox coordinates
        return {
            top: target.y + viewboxHeight * 0.5,
            right: target.x + viewboxWidth * 0.5,
            bottom: target.y - viewboxHeight * 0.5,
            left: target.x - viewboxWidth * 0.5,
        };
    }

    /**
     * Convert screen space coordinates to viewport-relative coordinates.
     *
     * Screen coordinates have their origin at the top left, the returned
     * viewport-relative coordintes use a Cartesian system with the origin at
     * the bottom left.
     * @param clientX X screen position
     * @param clientY Y screen position
     * @returns Tuple of X and Y in viewport coordinates
     */
    private clientSpaceToViewportSpace(clientX: number, clientY: number): [number, number] {
        // TODO: These DOM references should be cached somewhere
        const bbox = this.viewport.getBoundingClientRect();
        let relX = 1 - (bbox.width + bbox.left - clientX) / bbox.width;
        let relY = (bbox.height + bbox.top - clientY) / bbox.height;
        return [relX, relY];
    }
}