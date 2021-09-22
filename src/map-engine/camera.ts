/// <reference path="./support.ts" />
/// <reference path="./types.ts" />

/**
 * Map camera handler.
 * 
 * This class is responsible for tracking the camera position and target, and
 * provides methods for manipulating the camera in space.
 */
class MapCamera {

    // Constants

    /** Maximum zoom level (10 CSS pixels per map pixel). */
    private readonly maxZoom: number = 10.0
    /** Zoom level step size (logarithmic scaling factor when zooming). */
    private readonly zoomStep: number = 1.5;

    // Derived and cached attributes

    /** Precalculated zoom levels available for the given map size. */
    private zoom: number[];
    private viewHeight: number;
    private viewWidth: number;

    // Camera state

    /** Current zoom level index within the `zoom` array. */
    private zoomIndex: number = -1;
    /**
     * Current target of the camera.
     * 
     * This is the map location the centre of the camera is pointing at.
     */
    target: Point;

    constructor(mapSize: number, viewportHeight: number, viewportWidth: number) {
        this.viewHeight = viewportHeight;
        this.viewWidth = viewportWidth;
        // Calculate zoom factors
        let zoom = this.maxZoom;
        this.zoom = [this.maxZoom];
        const stepInverse = 1 / this.zoomStep;
        while (mapSize * zoom > Math.min(viewportHeight, viewportWidth)) {
            zoom *= stepInverse;
            this.zoom.push(Utils.roundTo(zoom, 2));
        }
        // Initial zoom level
        this.zoomIndex = this.zoom.length - 1;
        // Initial camera position
        this.target = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };
    }

    /**
     * Increment or decrement the zoom level.
     *
     * If `direction` is zero, do nothing.
     * @param direction Direction to bump the zoom level in
     * @returns New zoom level
     */
    bumpZoomLevel(direction: number): number {
        let index = this.zoomIndex;
        // Bump zoom level
        if (direction == 0)
            return index;
        if (direction < 0)
            index--;
        else if (direction > 0)
            index++;
        // Limit zoom range
        if (index < 0)
            index = 0;
        else if (index >= this.zoom.length)
            index = this.zoom.length - 1;
        // Update zoom level
        this.zoomIndex = index;
        return this.zoom[index];
    }

    /**
     * Return the current zoom level of the camera.
     * @returns Current map scaling factor.
     */
    getZoom(): number {
        return this.zoom[this.zoomIndex];
    }

    /**
     * Update the camera zoom level.
     * 
     * The value of `direction` is ignored, it will be treated as -1, 0, or 1
     * depending on the sign.
     * `viewX` and `viewY` are values between 0 and 1 representing the relative
     * position of the zoom target. The origin lies in the top left corner of
     * the camera frame.
     * @param direction Zoom level change
     * @param viewX Relative X position of the zoom target
     * @param viewY Relative Y position of the zoom target
     * @returns New camera target after the zoom operation
     */
    zoomTo(direction: number, viewX: number = 0.5, viewY: number = 0.5): Point {
        const oldZoom = this.getZoom()
        const newZoom = this.bumpZoomLevel(direction)

        const pixelDeltaX = (this.viewWidth / oldZoom) - (this.viewWidth / newZoom);
        const pixelDeltaY = (this.viewHeight / oldZoom) - (this.viewHeight / newZoom);

        // Depending on where the cursor is in the 0-1 camera view space, the
        // pixel delta must be distributed between the two sides of the viewport
        // in [-0.5, 0.5] range.
        const sideRatioX = Utils.remap(viewX, 0.0, 1.0, -0.5, 0.5);
        const sideRatioY = -Utils.remap(viewY, 0.0, 1.0, -0.5, 0.5);

        // Calculate the new camera target based on the zoom offsets
        const targetX = this.target.x + pixelDeltaX * sideRatioX;
        const targetY = this.target.y + pixelDeltaY * sideRatioY;

        // Update and return the camera target
        this.target = {
            x: targetX,
            y: targetY
        };
        return this.target;
    }

    /**
     * Estimate the visible map are for a given map target.
     * @param target The camera target (i.e. centre of the client viewport)
     * @returns A new viewbox denoting the visible map area
     */
    viewboxFromTarget(target: Point): Box {
        // Calculate the lengths covered by the viewport in map units
        const viewboxWidth = this.viewWidth / this.getZoom();
        const viewboxHeight = this.viewHeight / this.getZoom();
        // Get viewbox coordinates
        return {
            top: target.y + viewboxHeight * 0.5,
            right: target.x + viewboxWidth * 0.5,
            bottom: target.y - viewboxHeight * 0.5,
            left: target.x - viewboxWidth * 0.5,
        };
    }
}