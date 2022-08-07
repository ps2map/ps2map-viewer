/// <reference path="./map-layer.ts" />

/**
 * Layer manager for the current map. This class is responsible for adding and
 * removing map layers, showing and hiding them, and retrieving them.
 */
class LayerManager {
    readonly anchor: HTMLElement;
    readonly mapSize: Box;

    private _layers: MapLayer[] = [];

    constructor(viewport: HTMLDivElement, mapSize: Box) {
        this.mapSize = mapSize;
        const anchor = document.createElement("div");

        // Centre anchor in parent element
        anchor.style.position = "absolute";
        anchor.style.left = "50%";
        anchor.style.top = "50%";
        anchor.style.transform = "translate(-50%, -50%)";

        viewport.appendChild(anchor);
        this.anchor = anchor;
    }

    addLayer(layer: MapLayer): void {
        if (layer.size.width !== this.mapSize.width &&
            layer.size.height !== this.mapSize.height)
            throw new Error(`Size of added layer "${layer.id}" does not ` +
                `match current map size.`);
        // Check if a layer with the same id already exists.
        if (this._layers.some(l => l.id === layer.id))
            throw new Error(`A layer with the id "${layer.id}" already exists.`);
        this._layers.push(layer);
        this.anchor.appendChild(layer.element);
    }

    allLayers(): MapLayer[] {
        return this._layers;
    }

    clear(): void {
        this.anchor.innerHTML = "";
        this._layers = [];
    }

    forEachLayer(callback: (layer: MapLayer) => void): void {
        this._layers.forEach(callback);
    }

    getLayer<Type extends MapLayer>(id: string): Type | null {
        const layer = this._layers.find(l => l.id === id);
        if (layer instanceof MapLayer)
            return layer as Type;
        return null;
    }

    isEmpty(): boolean {
        return this._layers.length === 0;
    }

    removeLayer(id: string): void {
        const layer = this.getLayer(id);
        if (layer) {
            this._layers = this._layers.filter(l => l !== layer);
            this.anchor.removeChild(layer.element);
        }
    }

    updateAll(): void {
        this._layers.forEach(layer => layer.updateLayer());
    }
}
