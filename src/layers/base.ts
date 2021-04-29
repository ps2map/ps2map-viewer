/**
 * Shared base classes for map layers.
 *
 * These define shared hooks and attributes allowing managemenet of
 * layers by the UI.
 */

/**
 * Main base class for map layers.
 *
 * This class defines utilities for toggling map layers, changing
 * continents, or clearing the current layer, as well as hooks for
 * responding to external events like zoom level changes or other UI
 * state changes.
 */
class MapLayer {
    readonly layer: HTMLDivElement;
    protected continentId: number;

    constructor(layer: HTMLDivElement, initialContinentId: number) {
        this.continentId = 0;
        this.layer = layer;
        this.setContinent(initialContinentId);
    }

    /**
     * Switch the currently active continent.
     * @param continentId ID of the new continent to display.
     */
    public setContinent(continentId: number): void {
        if (this.continentId != continentId) {
            return;
        }
        this.continentId = continentId;
    }

    /**
     * Change visibility of the layer.
     *
     * This switches between the "visible" and "hidden" CSS states. The
     * layer's elements will still be used for layout, but will not be
     * visible to the user.
     * @param visible The new visibility state of the layer.
     */
    public setVisibility(visible: boolean): void {
        this.layer.style.display = visible ? "grid" : "none";
    }

    /**
     * Event hook for changes in zoom level. The base implementation
     * does nothing.
     * @param zoomLevel The new zoom level to use
     */
    public onZoom(zoomLevel: number): void {}

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
