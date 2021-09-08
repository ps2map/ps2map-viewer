/// <reference path="./map-layer.ts" />
/// <reference path="./static-layer.ts" />


class MapController {
    readonly viewport: HTMLDivElement;

    protected readonly content: HTMLDivElement;
    protected layers: Map<string, MapLayer> = new Map();
    protected scale: number;
    protected mapSize: number;

    constructor(viewport: HTMLDivElement, mapSize: number) {
        this.viewport = viewport;
        // Create dummy content object to facilitate hardware scrolling
        this.content = document.createElement("div");
        this.viewport.appendChild(this.content);

        // Initialise the map size
        this.mapSize = mapSize;

        const viewportSize = viewport.clientWidth / 10;
        this.scale = mapSize / viewportSize;
    }

    addLayer(element: MapLayer): void {
        element.setMapSize(this.mapSize);
        this.layers.set(element.name, element);
        this.content.appendChild(element.layer);
    }

    getMapSize(): number {
        return this.mapSize;
    }

    setMapSize(value: number): void {
        this.mapSize = value;
        this.layers.forEach((mapLayer) => {
            mapLayer.setMapSize(value);
        });
    }

    getScale(): number {
        return this.scale;
    }

    setScale(value: number): void {
        this.scale = value;
        // TODO: Calculate the new layer sizes for a given scale
    }

}
