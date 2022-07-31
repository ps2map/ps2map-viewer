/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

class CanvasLayer extends StaticLayer {

    private _lines: Readonly<Point>[][] = [];

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__canvas");
    }

    public calculateStrokeWidth(zoom: number): number {
        // NOTE: This formula is "magic"; suitable stroke widths were noted for
        // each zoom level, then fitted to an exponential function.
        return 1.6 + 23.67 / Math.pow(2, zoom / 0.23);
    }

    public update(lines: Readonly<Point>[][], zoom: number): void {
        this._lines = lines;
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = this.calculateStrokeWidth(zoom);
        const halfSize = this.mapSize * 0.5;
        lines.forEach(line => {
            let point = line[0];
            if (!point)
                return;
            ctx.moveTo(halfSize + point.x, halfSize - point.y);
            for (let i = 1; i < line.length; i++) {
                point = line[i];
                if (!point)
                    return;
                ctx.lineTo(halfSize + point.x, halfSize - point.y);
            }
            ctx.stroke();
        });
    }

    public getCanvas(): HTMLCanvasElement {
        const element = this.element.firstChild as HTMLCanvasElement | null;
        if (!element)
            throw "Unable to find canvas element";
        return element;
    }

    static async factory(continent: Continent, id: string): Promise<CanvasLayer> {
        const layer = new CanvasLayer(id, continent.map_size);
        const frag = document.createDocumentFragment();
        const canvas = document.createElement("canvas");
        if (!canvas.getContext)
            console.error("Unable to create canvas element");
        canvas.width = canvas.height = layer.mapSize;
        frag.appendChild(canvas);
        layer.element.appendChild(frag);
        return layer;
    }

    protected deferredLayerUpdate(_: ViewBox, zoom: number): void {
        this.update(this._lines, zoom);
    }
}
