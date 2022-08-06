/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

class CanvasLayer extends StaticLayer {

    public readonly canvas: HTMLCanvasElement;

    private constructor(id: string, mapSize: number, canvas: HTMLCanvasElement) {
        super(id, mapSize);
        this.canvas = canvas;
        this.element.classList.add("ps2map__canvas");
    }

    static async factory(continent: Continent, id: string
    ): Promise<CanvasLayer> {
        // Attempt to create an HTML canvas. If this fails, fail the promise
        // and let the caller handle the lack of canvas support.
        const canvas = document.createElement("canvas");
        if (!canvas.getContext)
            return Promise.reject("HTML Canvas not supported");
        canvas.width = canvas.height = continent.map_size;

        const layer = new CanvasLayer(id, continent.map_size, canvas);
        layer.element.appendChild(canvas);
        return layer;
    }

    /**
     * Return the appropriate stroke width for the current zoom level.
     * 
     * @remarks
     * This function is quite magic and tied to the zoom level calculation
     * logic. This keeps the stroke width consistent across zoom levels.
     *
     * @param zoom - Current zoom level in CSS pixels per map unit.
     * @returns Stroke width in CSS pixels.
     */
    public calculateStrokeWidth(zoom: number): number {
        // NOTE: This formula is "magic"; suitable stroke widths were noted for
        // each zoom level, then fitted to an exponential function. With a bit
        // of thought, it should be possible to replace this with a proper
        // inverse of the nextZoom = lastZoom * 1.5 formula used in the zooming
        // code, ideally as a utility method of the map camera itself.
        return 1.6 + 23.67 / Math.pow(2, zoom / 0.23);
    }
}
