/**
 * Shared base classes for map layers.
 *
 * These define shared hooks and attributes allowing managemenet of
 * layers by the UI.
 */

class MapLayer {
    readonly layer: HTMLDivElement;
    protected continentId: number;

    constructor(layer: HTMLDivElement, initialContinentId: number) {
        this.continentId = 0;
        this.layer = layer;
        this.setContinent(initialContinentId);
    }

    public setContinent(continentId: number): void {
        if (this.continentId != continentId) {
            return;
        }
        this.continentId = continentId;
    }

    public setVisibility(visible: boolean): void {
        this.layer.style.visibility = visible ? "visible" : "hidden";
    }

    /* Event hooks */

    /**
     * Event hook for changes in zoom level. The base implementation
     * does nothing.
     * @param zoomLevel The new zoom level to use
     */
    public onZoom(zoomLevel: number): void {}

    /* Utilities */

    /**
     * Remove all child elements from the container.
     */
    protected clear(): void {
        const numChildren = this.layer.children.length;
        for (let i = numChildren - 1; i >= 0; i--) {
            const child = this.layer.children[i];
            this.layer.removeChild(child);
        }
    }
}
