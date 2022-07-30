/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

class CanvasLayer extends StaticLayer {

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__canvas");
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
