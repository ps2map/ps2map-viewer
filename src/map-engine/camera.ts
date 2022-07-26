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

    /** Maximum zoom level (400%, i.e. 4 CSS pixels per map pixel). */
    private readonly _maxZoom: number = 4.0
    /** Zoom level step size (logarithmic scaling factor when zooming). */
    private readonly _zoomStep: number = 1.5;

    // Derived and cached attributes

    /** Precalculated zoom levels available for the given map size. */
    private _zoomLevels: number[];

    /** Cache for viewport height and width. */
    private _viewportHeight: number;
    private _viewportWidth: number;

    // Camera state

    /** Current zoom level index within the `zoom` array. */
    private _currentZoomIndex: number = -1;
    /**
     * Current target of the camera.
     * 
     * This is the map location the centre of the camera is pointing at.
     */
    target: Point;

    constructor(mapSize: number, viewportHeight: number, viewportWidth: number) {
        this._viewportHeight = viewportHeight;
        this._viewportWidth = viewportWidth;
        // Calculate zoom factors
        let zoom = this._maxZoom;
        this._zoomLevels = [this._maxZoom];
        const stepInverse = 1 / this._zoomStep;
        while (mapSize * zoom > Math.min(viewportHeight, viewportWidth)) {
            zoom *= stepInverse;
            this._zoomLevels.push(Utils.roundTo(zoom, 2));
        }
        // Initial zoom level
        this._currentZoomIndex = this._zoomLevels.length - 1;
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
        let newIndex = this._currentZoomIndex;
        // Bump zoom level
        if (direction < 0)
            newIndex--;
        else if (direction > 0)
            newIndex++;
        // Limit zoom range
        if (newIndex < 0)
            newIndex = 0;
        else if (newIndex >= this._zoomLevels.length)
            newIndex = this._zoomLevels.length - 1;
        // Update zoom level
        this._currentZoomIndex = newIndex;
        return this._zoomLevels[newIndex]!;
    }

    /**
     * Returns teh current viewBox of the camera.
     * @returns Current viewBox object.
     */
    getViewBox(): ViewBox {
        // Calculate the lengths covered by the viewport in map units
        const viewBoxHeight = this._viewportHeight / this.getZoom();
        const viewBoxWidth = this._viewportWidth / this.getZoom();
        // Get viewBox coordinates
        return {
            top: this.target.y + viewBoxHeight * 0.5,
            right: this.target.x + viewBoxWidth * 0.5,
            bottom: this.target.y - viewBoxHeight * 0.5,
            left: this.target.x - viewBoxWidth * 0.5,
        };
    }

    /**
     * Return the current zoom level of the camera.
     * @returns Current map scaling factor.
     */
    getZoom(): number {
        let zoom = this._zoomLevels[this._currentZoomIndex];
        if (!zoom) {
            const old = zoom;
            zoom = this.bumpZoomLevel(0); // Clamp zoom level to valid range
            console.warn(`Clamped zoom level from ${old} to `
                + this._currentZoomIndex);
        }
        return zoom;
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

        const pixelDeltaX = (this._viewportWidth / oldZoom) - (this._viewportWidth / newZoom);
        const pixelDeltaY = (this._viewportHeight / oldZoom) - (this._viewportHeight / newZoom);

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
}