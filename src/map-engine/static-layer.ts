/// <reference path="./map-layer.ts" />

/**
 * Static MapLayer implementation.
 *
 * Static layers are the simplest form, only getting panned and scaled as the
 * user interacts with the map. They are always rendered and no occlusion
 * checks or optimisations are used whatsoever - avoid them when possible.
 */
class StaticLayer extends MapLayer {
    constructor(id: string, size: Box) {
        super(id, size);
    }

    protected deferredLayerUpdate(_: ViewBox, __: number): void {
        // Nothing to do
    }

    redraw(viewBox: ViewBox, zoom: number): void {
        const targetX = (viewBox.right + viewBox.left) * 0.5;
        const targetY = (viewBox.top + viewBox.bottom) * 0.5;
        // Initial offset to move the centre of the SVG to its CSS origin
        const halfSizeX = this.size.width * 0.5;
        const halfSizeY = this.size.height * 0.5;
        let offsetX = -halfSizeX;
        let offsetY = -halfSizeY;
        // Another offset to shift the view box target to the origin
        offsetX += (halfSizeX - targetX) * zoom;
        offsetY -= (halfSizeY - targetY) * zoom;
        // Apply transform
        this.element.style.transform = (
            `matrix(${zoom}, 0.0, 0.0, ${zoom}, ${offsetX}, ${offsetY})`);
    }
}
