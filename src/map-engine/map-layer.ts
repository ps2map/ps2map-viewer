/// <reference path="./types.ts" />

/**
 * Abstract base class for map layers.
 * 
 * Map layers are generally anything that is tied to the map canvas and
 * moves when the map is panned by the user.
 */
abstract class MapLayer {
    /** Unique name of the map layer. */
    readonly name: string;
    /**
     * Container for the layer's elements.
     * 
     * This layer has no size and is only used as a logical container
     * within the DOM.
     */
    readonly layer: HTMLDivElement;

    protected mapSize: number;

    /** Whether the layer is currently visible. */
    protected isVisible: boolean = true;

    constructor(name: string, mapSize: number) {
        this.layer = document.createElement("div");
        this.layer.classList.add("ps2map__layer");
        this.name = name;
        this.mapSize = mapSize;
        this.layer.style.width = this.layer.style.height = `${mapSize} px`;
    }

    getMapSize(): number {
        return this.mapSize;
    }

    setMapSize(value: number): void {
        this.mapSize = value;
    }

    /** Hide the map layer. */
    hide(): void {
        this.isVisible = false;
    }
    /** Show the map layer. */
    show(): void {
        this.isVisible = true;
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
     * @param scale New map scale
     */
    abstract redraw(viewbox: Box, scale: number): void;
}
