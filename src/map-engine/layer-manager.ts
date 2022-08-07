/// <reference path="./map-layer.ts" />

/**
 * Layer manager for the current map. This class is responsible for adding and
 * removing map layers, showing and hiding them, and retrieving them.
 */
class LayerManager {
    readonly mapSize: Box;

    private readonly _anchor: HTMLElement;
    private _layers: MapLayer[] = [];

    constructor(anchor: HTMLElement, mapSize: Box) {
        this.mapSize = mapSize;
        this._anchor = anchor;
        anchor.classList.add("ps2map__anchor");
    }

    addLayer(layer: MapLayer): void {
        if (layer.size == this.mapSize)
            throw new Error(`Size of added layer "${layer.id}" does not ` +
                `match current map size.`);
        // Check if a layer with the same id already exists.
        if (this._layers.some(l => l.id === layer.id))
            throw new Error(`A layer with the id "${layer.id}" already exists.`);
        this._layers.push(layer);
        this._anchor.appendChild(layer.element);
    }

    clear(): void {
        this._anchor.innerHTML = "";
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
            this._anchor.removeChild(layer.element);
        }
    }

    updateAll(): void {
        this._layers.forEach(layer => layer.updateLayer());
    }
}
