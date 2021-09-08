/// <reference path="./map-layer.ts" />

/**
 * Static MapLayer implementation.
 * 
 * Static layers are the simplest form, only getting panned and scaled as the
 * user interacts with the map. They are always rendered and no occlusion
 * checks or optimisations are used whatsoever - avoid them when possible.
 */
class StaticLayer extends MapLayer {
    /**
     * Add a new child to the layer.
     * @param element Element to add
     */
    addChild(element: Node): void {
        this.layer.appendChild(element);
    }

    /**
     * Remove a child from the layer.
     * @param element Element to remove
     */
    removeChild(element: HTMLElement): void {
        this.layer.removeChild(element);
    }

    /** Remove all children from the layer. */
    clearChildren(): void {
        this.layer.innerHTML = "";
    }

    redraw(viewbox: Box, scale: number): void {
        // TODO: The "scale" parameter has no real meaning yet, this will
        // require tweaking once it does.
        let factor = 1 / scale;
        this.layer.style.transform = `scale3D(${factor}, ${factor}, 0.0)`;
    }
}

