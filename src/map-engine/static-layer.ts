/// <reference path="./map-layer.ts" />

/**
 * Static MapLayer implementation.
 *
 * Static layers are the simplest form, only getting panned and scaled as the
 * user interacts with the map. They are always rendered and no occlusion
 * checks or optimisations are used whatsoever - avoid them when possible.
 */
class StaticLayer extends MapLayer {
    constructor(id: string, mapSize: number) {
        super(id, mapSize);
    }

    protected deferredLayerUpdate(_: Box, __: number): void { }

    redraw(viewBox: Box, zoom: number): void {
        const targetX = (viewBox.right + viewBox.left) * 0.5;
        const targetY = (viewBox.top + viewBox.bottom) * 0.5;
        // Initial offset to move the centre of the SVG to its CSS origin
        const halfMapSize = this.mapSize * 0.5;
        let offsetX = -halfMapSize;
        let offsetY = -halfMapSize;
        // Another offset to shift the view box target to the origin
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom; // -1 to fix Y axis origin
        // Apply transform
        this.element.style.transform = (
            `matrix(${zoom}, 0.0, 0.0, ${zoom}, ${offsetX}, ${offsetY})`);
    }
}