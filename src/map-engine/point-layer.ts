/// <reference path="./map-layer.ts" />
/// <reference path="./support.ts" />

/**
 * Helper object storing position and display options for point features.
 */
class PointFeature {
    /** HTML element associated with the feature. */
    readonly element: HTMLElement;
    /** Unique identifier for the feature. */
    readonly id: number;
    /** Position of the feature on the map. */
    readonly pos: Point;
    /** Minimum zoom level at which the element is visible. */
    readonly minZoom: number;
    /** Visibility DOM cache */
    visible: boolean = true;

    constructor(pos: Point, id: number, element: HTMLElement, minZoom: number = 0) {
        this.element = element;
        this.id = id;
        this.pos = pos;
        this.minZoom = minZoom;
    }
}

class PointLayer extends MapLayer {
    /** Container for point features loaded into the layer. */
    features: PointFeature[] = []
    /** Timer used to delay layer updates while zooming. */
    private layerUpdateTimerId: number | null = null;

    redraw(viewbox: Box, zoom: number): void {
        const targetX = (viewbox.right + viewbox.left) * 0.5;
        const targetY = (viewbox.top + viewbox.bottom) * 0.5;
        // Initial offset to move the centre of the SVG to its CSS origin
        const halfMapSize = this.mapSize * 0.5;
        let offsetX = -halfMapSize;
        let offsetY = -halfMapSize;
        // Another offset to shift the viewbox target to the origin
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom; // -1 to fix Y axis origin
        // Apply transform
        this.element.style.transform = (
            `matrix(${zoom}, 0.0, 0.0, ${zoom}, ${offsetX}, ${offsetY})`);
        // Schedule layer resize after transition animation finished
        if (this.layerUpdateTimerId != null)
            clearTimeout(this.layerUpdateTimerId);
        this.layerUpdateTimerId = setTimeout(
            this.resizeLayer.bind(this), 200, viewbox, zoom);
    }

    /**
     * Update the layer geometry after the CSS transition finished.
     * @param viewbox New viewbox to apply
     */
    private resizeLayer = Utils.rafDebounce((viewbox: Box, zoom: number) => {
        const unzoom = 1 / zoom;
        let i = this.features.length;
        while (i-- > 0) {
            const feat = this.features[i];
            // FIXME: Temporary solution; the layer is still scaled by a CSS
            // transformation matrix, which is not the point of point layers.
            feat.element.style.fontSize = `calc(20px * ${unzoom})`;
            feat.element.style.display = zoom >= feat.minZoom ? "block" : "none";
            feat.visible = zoom >= feat.minZoom;
        }
    });
}