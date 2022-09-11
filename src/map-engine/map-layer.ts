/// <reference path="./types.ts" />

/**
 * Base class for map layers.
 *
 * Map layers are layered map conents that are tied to the map canvas and move
 * as the map is panned by the user.
 */
abstract class MapLayer {
    /** Unique identifier for this layer and the DOM element it represents. */
    readonly id: string;
    /** Base size of the map layer in CSS pixels. */
    readonly size: Box;
    /** DOM element containing the layer's features. */
    readonly element: HTMLDivElement;

    /** Whether the layer is currently visible. */
    protected isVisible: boolean = true;

    /** Internal cache for deferred layer updates. */
    private _lastRedraw: [ViewBox, number] | null = null;

    constructor(id: string, size: Box) {
        this.id = id;
        this.size = size;
        // Create content element
        this.element = document.createElement("div");
        this.element.id = id;
        this.element.classList.add("ps2map__layer");
        this.element.style.height = `${size.height}px`;
        this.element.style.width = `${size.width}px`;
        // Add event listener for deferred updates
        this.element.addEventListener("transitionend",
            this._runDeferredLayerUpdate.bind(this), { passive: true });
    }

    /**
     * External hook used by the map renderer to store redraw call arguments.
     *
     * This is used to support the runDeferredLayerUpdate method and should not
     * be called from or modified in sub classes.
     * @param viewBox New view box of the client
     * @param zoom New zoom level
     */
    setRedrawArgs(viewBox: ViewBox, zoom: number): void {
        this._lastRedraw = [viewBox, zoom];
    }

    /**
     * Update the visibility of the map layer.
     * @param visible New visibility state to apply
     */
    setVisibility(visible: boolean): void {
        if (this.isVisible === visible)
            return;
        if (visible) {
            this.element.style.removeProperty("display");
            this.element.dispatchEvent(new Event("transitionend"));
        } else {
            this.element.style.display = "none";
        }
        this.isVisible = visible;
    }

    /** Hook for manually triggering a layer update. */
    updateLayer(): void {
        this.element.dispatchEvent(new Event("transitionend"));
    }

    /** Wrapper to run deferred layer updates from event listeners. */
    private readonly _runDeferredLayerUpdate = rafDebounce(() => {
        if (!this._lastRedraw)
            return;
        const [viewBox, zoom] = this._lastRedraw;
        this.deferredLayerUpdate(viewBox, zoom);
    });

    /**
     * Callback used to trigger updates in the map layer.
     *
     * Implement this hook to control visibility and zoom level updates
     * efficiently.
     *
     * Do not call `requestAnimationFrame()` as part of this method as timing
     * is the responsibility of the caller. Debouncing and other throttling
     * strategies are permitted.
     * @param viewBox New view box of the client
     * @param zoom New zoom level
     */
    abstract redraw(viewBox: ViewBox, zoom: number): void;

    /**
     * Implementation of the deferred layer update.
     *
     * This is similar to `MapLayer.redraw()`, but only runs after all zooming
     * or panning animations ended. Use this hook for expensive layer updates
     * like visibility checks or DOM updates.
     * @param viewBox New view box of the client
     * @param zoom New zoom level
     */
    protected abstract deferredLayerUpdate(
        viewBox: ViewBox,
        zoom: number,
    ): void;
}

/**
 * Static MapLayer implementation.
 *
 * Static layers are the simplest form, only getting panned and scaled as the
 * user interacts with the map. They are always rendered and no occlusion
 * checks or optimisations are used whatsoever - avoid them when possible.
 */
class StaticLayer extends MapLayer {
    protected deferredLayerUpdate(_: ViewBox, __: number): void {
        // Nothing to do
    }

    redraw(viewBox: ViewBox, zoom: number): void {
        const targetX = (viewBox.right + viewBox.left) * 0.5;
        const targetY = (viewBox.top + viewBox.bottom) * 0.5;
        // Initial offset to move the centre of the SVG to its CSS origin
        const halfSizeX = this.size.width * 0.5;
        const halfSizeY = this.size.height * 0.5;
        // Another offset to shift the view box target to the origin
        const offsetX = -halfSizeX - targetX * zoom;
        const offsetY = -halfSizeY + targetY * zoom;
        // Apply transform
        this.element.style.transform = (
            `matrix(${zoom}, 0.0, 0.0, ${zoom}, ${offsetX}, ${offsetY})`);
    }
}
