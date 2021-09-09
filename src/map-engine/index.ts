/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />


class MapController {
    readonly viewport: HTMLDivElement;

    private readonly content: HTMLDivElement;
    private layers: Map<string, MapLayer> = new Map();
    private scale: number;
    private mapSize: number;

    private numZoomLevels = 12;
    private zoomLevels: number[];
    private zoom: number;

    constructor(viewport: HTMLDivElement, mapSize: number) {
        this.viewport = viewport;
        // Create dummy content object to facilitate hardware scrolling
        this.content = document.createElement("div");
        this.viewport.appendChild(this.content);

        // Initialise the map size
        this.mapSize = mapSize;
        this.scale = mapSize / this.viewportSizeInMetres();

        // Initialise to minimum zoom
        this.zoomLevels = this.calculateZoomLevels();
        this.zoom = this.zoomLevels[this.zoomLevels.length - 1];

        // Attach event listeners
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), { passive: true });
    }

    addLayer(layer: MapLayer): void {
        layer.setMapSize(this.mapSize);
        this.layers.set(layer.name, layer);
        this.content.appendChild(layer.element);
    }

    setScale(value: number): void {
        this.scale = value;
        this.layers.forEach((layer) => {
            // TODO: Determine proper viewbox
            layer.redraw({ top: 0, left: 0, right: 0, bottom: 0 }, value);
        });
    }

    /**
     * Event listener callback for mouse wheel zoom.
     * @param evt Wheel event to process
     */
    private onZoom(evt: WheelEvent) {
        const newZoom = this.bumpZoomLevel(evt.deltaY);
        this.setScale(this.zoomLevels[newZoom]);
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
        const map_scale_step = Math.pow(Math.round(min_scale / max_scale / 50)
            * 50, 1 / (this.numZoomLevels - 1))
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
}
