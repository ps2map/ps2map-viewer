/// <reference path="./map-layer.ts" />

/**
 * Static MapLayer implementation.
 * 
 * Static layers are the simplest form, only getting panned and scaled as the
 * user interacts with the map. They are always rendered and no occlusion
 * checks or optimisations are used whatsoever - avoid them when possible.
 */
class StaticLayer extends MapLayer {

    constructor(name: string, mapSize: number) {
        super(name, mapSize);
    }

    /**
     * Add a new child to the layer.
     * @param element Element to add
     */
    addChild(element: Node): void {
        this.element.appendChild(element);
    }

    /**
     * Remove a child from the layer.
     * @param element Element to remove
     */
    removeChild(element: HTMLElement): void {
        this.element.removeChild(element);
    }

    /** Remove all children from the layer. */
    clearChildren(): void {
        this.element.innerHTML = "";
    }

    redraw(viewbox: Box, scale: number): void {
        // TODO: The "scale" parameter has no real meaning yet, this will
        // require tweaking once it does.
        let factor = 1 / scale;
        this.element.style.transform = `scale3D(${factor}, ${factor}, 0.0)`;
    }
}
