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
    readonly mapSize: number;
    /** DOM element containing the layer's features. */
    readonly element: HTMLDivElement;
    /** Whether the layer is currently visible. */
    protected isVisible: boolean = true;

    constructor(id: string, mapSize: number) {
        this.id = id;
        this.mapSize = mapSize;
        // Create content element
        this.element = document.createElement("div");
        this.element.id = id;
        this.element.classList.add("ps2map__layer");
        this.element.style.height = this.element.style.width = `${mapSize}px`;
    }

    /**
     * Update the visibility of the map layer.
     * @param visible New visibility state to apply
     */
    setVisibility(visible: boolean): void {
        if (this.isVisible == visible)
            return;
        if (visible)
            this.element.style.removeProperty("display");
        else
            this.element.style.display = "none";
        this.isVisible = visible;
    }

    /**
     * Callback used to trigger updates in the map layer.
     *
     * Implement this hook to control visibility and zoom level updates
     * efficiently.
     *
     * Do not call requestAnimationFrame() as part of this method as timing is
     * the responsibility of the caller. Debouncing and other throttling
     * strategies are permitted.
     * @param viewbox New viewbox of the client
     * @param zoom New zoom level
     */
    abstract redraw(viewbox: Box, zoom: number): void;
}


/**
 * Customised MapLayer base class that uses a two-stage layer update system.
 * 
 * In the first step, `redraw()`, only cheap updates are performed, like
 * updating the CSS transformation for static layers. In a second step, the
 * `deferredLayerUpdate()` hook will perform major updates like visibility
 * checks or texture replacements once the map is idle (i.e. not scrolling or
 * zooming).
 */
abstract class StagedUpdateLayer extends MapLayer {
    /** Internal cache for two-stage layer updates. */
    private lastRedraw: [Box, number] | null = null;

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.addEventListener(
            "transitionend", this.runDeferredLayerUpdate.bind(this), { passive: true });
    }

    /**
     * External hook used by the map renderer to store redraw call arguments.
     * 
     * This is used to implement the StagedUpdateLayer class and should not be
     * called from or modified in sub classes.
     * @param viewbox New viewbox of the client
     * @param zoom New zoom level
     */
    storeRedrawArgs(viewbox: Box, zoom: number): void {
        this.lastRedraw = [viewbox, zoom];
    }

    /** Wrapper to run deferred layer updates from event listeners. */
    private runDeferredLayerUpdate = Utils.rafDebounce(() => {
        if (this.lastRedraw == null)
            return;
        const [viewbox, zoom] = this.lastRedraw;
        this.deferredLayerUpdate(viewbox, zoom);
    });

    /**
     * Implementation of the deferred layer update.
     * 
     * This is similar to `MapLayer.redraw`, but only runs after all zooming or
     * panning animations ended. Use this hook for expensive layer updates like
     * visibility checks or DOM updates.
     * @param viewbox New viewbox of the client
     * @param zoom New zoom level
     */
    protected abstract deferredLayerUpdate(viewbox: Box, zoom: number): void;
}