/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

class CanvasLayer extends StaticLayer {

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__canvas");
    }

    public update(lines: Readonly<Point>[][]): void {
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 10;
        lines.forEach(line => {
            let point = line[0];
            if (!point)
                return;
            ctx.moveTo(this.mapSize * 0.5 + point.x, this.mapSize * 0.5 - point.y);
            for (let i = 1; i < line.length; i++) {
                point = line[i];
                if (!point)
                    return;
                ctx.lineTo(this.mapSize * 0.5 + point.x, this.mapSize * 0.5 - point.y);
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
        // TODO: Add scaling?
        canvas.width = canvas.height = layer.mapSize;
        frag.appendChild(canvas);
        layer.element.appendChild(frag);
        return layer;
    }
}
