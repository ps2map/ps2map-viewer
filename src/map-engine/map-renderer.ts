/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />


class MapRenderer {
    readonly viewport: HTMLDivElement;

    private readonly anchor: HTMLDivElement;
    private layers: Map < string, MapLayer > = new Map();
    private scale: number;
    private mapSize: number;

    private numZoomLevels = 12;
    private zoomLevels: number[];
    private zoom: number;

    private panOffsetX: number;
    private panOffsetY: number;

    private cameraTarget: Point;

    constructor(viewport: HTMLDivElement, mapSize: number) {
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.anchor = document.createElement("div");
        this.anchor.classList.add("ps2map__anchor")
        this.viewport.appendChild(this.anchor);

        // Initialise the map size
        this.mapSize = mapSize;
        this.scale = mapSize / this.viewportSizeInMetres();
        this.bumpZoomLevel(1);
        this.cameraTarget = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };

        // Initialise to minimum zoom
        this.zoomLevels = this.calculateZoomLevels();
        this.zoom = this.zoomLevels[this.zoomLevels.length - 1];

        // Initialise panning offset
        this.panOffsetX = this.viewport.clientWidth * 0.5;
        this.panOffsetY = this.viewport.clientHeight * 0.5;

        // Attach event listeners
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this.mousePan.bind(this), {
            passive: true
        });
    }

    addLayer(layer: MapLayer): void {
        layer.setMapSize(this.mapSize);
        this.layers.set(layer.name, layer);
        this.anchor.appendChild(layer.element);
        layer.redraw(this.viewboxFromCameraTarget(this.cameraTarget, this.scale), this.scale);
    }

    setScale(value: number): void {
        this.scale = value;
    }

    /**
     * Event listener callback for mouse wheel zoom.
     * @param evt Wheel event to process
     */
    private onZoom(evt: WheelEvent): void {
        evt.preventDefault();
        const newZoom = this.bumpZoomLevel(evt.deltaY);
        const newScale = this.zoomLevels[newZoom];

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

        // Update debug minimap
        this.updateMinimap(newViewbox);

        // Apply scale and schedule map layer updates
        this.setScale(newScale);
        this.layers.forEach((layer) => {
            layer.redraw(newViewbox, newScale);
        });
    }

    private mousePan(evtDown: MouseEvent): void {
        const refX = this.panOffsetX;
        const refY = this.panOffsetY;

        const startX = evtDown.clientX;
        const startY = evtDown.clientY;

        const drag = (evtDrag: MouseEvent) => {
            const deltaX = evtDrag.clientX - startX;
            const deltaY = evtDrag.clientY - startY;

            this.panOffsetX = refX + deltaX;
            this.panOffsetY = refY + deltaY;

            this.anchor.style.left = `${this.panOffsetX}px`;
            this.anchor.style.top = `${this.panOffsetY}px`;
        };

        document.addEventListener("mouseup", () => {
            this.viewport.removeEventListener("mousemove", drag);
        });

        this.viewport.addEventListener("mousemove", drag);
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

    /** Return the shorter axis of the viewport. */
    private viewportMinorAxis(): number {
        const height = this.viewport.clientHeight;
        const width = this.viewport.clientWidth;
        return height < width ? height : width;
    }

    /**
     * Estimate the size of the map viewport in metres.
     *
     * This assumes that a millimetre contains ~4 CSS pixels.
     * @returns Size of the viewport in real-world metres.
     */
    private viewportSizeInMetres(): number {
        return this.viewportMinorAxis() / 4000;
    }

    /**
     * Increment or decrement the zoom level.
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

        // Calculate the are covered by the viewport in map units
        const viewboxWidth = this.cssPxToMetres(viewportWidth, scale);
        const viewboxHeight = this.cssPxToMetres(viewportHeight, scale);
        // Generate viewbox
        return {
            top: target.y + viewboxHeight * 0.5,
            right: target.x + viewboxWidth * 0.5,
            bottom: target.y - viewboxHeight * 0.5,
            left: target.x - viewboxWidth * 0.5,
        };
    }

    private updateMinimap(viewbox: Box): void {
        const minimap = document.getElementById("debug-minimap");
        const box = document.getElementById("debug-minimap__viewbox");
        if (minimap == null || box == null) return;
        const minimapSize = minimap.clientHeight;
        // Calculate the map-relative coordinates of the viewbox
        const relViewbox: Box = {
            top: (viewbox.top + this.mapSize * 0.5) / this.mapSize,
            left: (viewbox.left + this.mapSize * 0.5) / this.mapSize,
            bottom: (viewbox.bottom + this.mapSize * 0.5) / this.mapSize,
            right: (viewbox.right + this.mapSize * 0.5) / this.mapSize
        };
        const relHeight = relViewbox.top - relViewbox.bottom;
        const relWidth = relViewbox.right - relViewbox.left;
        const relLeft = relViewbox.left - 0.5;
        const relTop = relViewbox.bottom - 0.5;

        box.style.height = `${minimapSize * relHeight}px`;
        box.style.width = `${minimapSize * relWidth}px`;
        box.style.left = `${minimapSize * relLeft}px`;
        box.style.bottom = `${minimapSize * relTop}px`;

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