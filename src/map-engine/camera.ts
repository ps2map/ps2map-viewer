interface Box {
    readonly width: number;
    readonly height: number;
}

/**
 * Camera object for a map renderer.
 *
 * This object is responsible for calculating the viewBox of the map, i.e. the
 * parts of the map that are visible to the user. The viewBox is determined by
 * the current camera position and zoom level, and the size of the viewport.
 */
class Camera {
    // Current camera target in map coordinates
    public target: Readonly<Point>;

    // Zoom level configuration
    private readonly _maxZoom: number = 4.0;
    private readonly _stepSize: number = 1.5;
    // Dynamic zoom levels calculated depending on viewport and map size
    private _zoomLevels: Readonly<number[]> = [];
    private _zoomIndex: number = -1;
    // Cached viewport dimensions
    private _viewportSize: Readonly<Box>;

    constructor(
        mapSize: Readonly<Box>,
        viewportSize: Readonly<Box>,
        stepSize: number | undefined = undefined,
        maxZoom: number | undefined = undefined,
    ) {
        this._viewportSize = viewportSize;
        if (stepSize !== undefined) this._stepSize = stepSize;
        if (maxZoom !== undefined) this._maxZoom = maxZoom;

        // Calculate zoom levels for the given viewport and map
        this._zoomLevels = this._calculateZoomLevels(mapSize);

        // Set default zoom and centre the camera
        this._zoomIndex = this._zoomLevels.length - 1;
        const factor = 0.5;
        this.target = {
            x: mapSize.width * factor,
            y: mapSize.height * factor,
        };
    }

    /**
     * Return the current camera view box.
     *
     * The view box is the part of the map that is visible to the user.
     */
    public viewBox(): Readonly<ViewBox> {
        // Calculate the map area covered by the viewport
        const zoom = this.zoom();
        const half = 0.5;
        const halfViewboxHeight = this._viewportSize.height * half / zoom;
        const halfViewboxWidth = this._viewportSize.width * half / zoom;
        // Calculate the edges of the viewport in map coordinates
        return {
            top: this.target.y + halfViewboxHeight,
            right: this.target.x + halfViewboxWidth,
            bottom: this.target.y - halfViewboxHeight,
            left: this.target.x - halfViewboxWidth,
        };
    }

    /**
     * Return the current zoom level of the camera.
     *
     * The returned value represents the number of CSS pixels covered by a
     * single map unit.
     */
    public zoom(): number {
        const zoom = this._zoomLevels[this._zoomIndex];
        if (zoom === undefined)
            throw new Error("Invalid zoom level");
        return zoom;
    }

    /**
     * Update the camera's zoom level.
     *
     * @remarks
     * A positive value will zoom in while a negative value will zoom out.
     * Zoom levels are clamped according to the `maxZoom` property and map
     * size. The new zoom level will be applied immediately and returned. A
     * value of zero will do nothing but still apply zoom level clamping.
     *
     * @param value Zoom level change. Only is-zero and sign are used.
     * @returns New zoom level
     */
    public bumpZoom(value: number): number {
        // Update zoom level index
        let index = this._zoomIndex;
        if (value < 0)
            index--;
        else if (value > 0)
            index++;
        // Clamp zoom level index
        if (index < 0)
            index = 0;
        else if (index >= this._zoomLevels.length)
            index = this._zoomLevels.length - 1;
        // Update zoom level
        this._zoomIndex = index;
        // Array value can't be undefined due to clamping
        const zoom = this._zoomLevels[index];
        if (zoom === undefined)
            throw new Error("Invalid zoom level");
        return zoom;
    }

    /**
     * Update the camera for a new viewport size.
     *
     * This method should be called in response to DOM size changes and will
     * adjust all zoom levels accordingly. A redraw is required after calling
     * this method.
     *
     * @param mapSize Size of the map in map units.
     * @param viewportSize CSS dimensions of the viewport.
     */
    public updateViewportSize(mapSize: Readonly<Box>, viewportSize: Readonly<Box>): void {
        this._viewportSize = viewportSize;
        // Recalculate zoom levels for the new viewport size
        const zoomIndex = this._zoomIndex;
        this._zoomLevels = this._calculateZoomLevels(mapSize);
        this._zoomIndex = zoomIndex;
    }

    /**
     * Jump to the given point on the map.
     *
     * @param point Point in map coordinates.
     */
    public jumpTo(point: Readonly<Point>): void {
        this.target = point;
    }

    /**
     * Zoom the camera towards the given point.
     *
     * This method is a combination of `bumpZoom()` and `pan()`. The camera
     * target will be adjusted to keep the map point corresponding to
     * `viewportRelPos` in the same position in the viewport.
     *
     * @param viewportRelPos Relative position of the fixed point in viewport.
     * @returns New camera target in map coordinates.
     */
    public zoomTowards(value: number, viewportRelPos: Readonly<Point>): Point {
        const oldZoom = this.zoom();
        const zoom = this.bumpZoom(value);
        // Calculate the viewport size change for the zoom level change
        const deltaX = (this._viewportSize.width / oldZoom)
            - (this._viewportSize.width / zoom);
        const deltaY = (this._viewportSize.height / oldZoom)
            - (this._viewportSize.height / zoom);
        // "Steer" the viewport size delta towards the fixed point
        const half = 0.5;
        const ratioX = -half + viewportRelPos.x;
        const ratioY = half - viewportRelPos.y;
        this.target = {
            x: Math.round(this.target.x + deltaX * ratioX),
            y: Math.round(this.target.y + deltaY * ratioY),
        };
        return this.target;
    }

    private _calculateZoomLevels(mapDimensions: Box): Readonly<number[]> {
        // Find the minor axis of the viewport and the major axis of the map
        const minViewport = Math.min(
            this._viewportSize.width,
            this._viewportSize.height,
        );
        const maxMap = Math.max(
            mapDimensions.width,
            mapDimensions.height,
        );

        // The maximum zoom level is fixed and always available
        const zoomLevels: number[] = [this._maxZoom];
        if (minViewport === 0)
            return zoomLevels;

        const base = 10;
        const numDecimals = 2;
        const round = (value: number): number => {
            const scale = base ** numDecimals;
            // EPSILON helps avoid most rounding errors, but not all - too bad!
            return Math.round((value + Number.EPSILON) * scale) / scale;
        };
        // Starting with the maximum zoom level, keep zooming out until the CSS
        // size of the map is smaller than the available viewport.
        const factor = 1 / this._stepSize;
        let zoom = this._maxZoom;
        while (maxMap * zoom > minViewport) {
            zoom *= factor;
            zoomLevels.push(round(zoom));
        }
        return zoomLevels;
    }
}
