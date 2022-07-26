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
    private _viewportDimensions: Readonly<Box>;
    private readonly _mapDimensions: Readonly<Box>;
    private readonly _maxZoom: number;
    private readonly _stepSize: number;

    private _zoomIndex: number = -1;
    private _zoomLevels: Readonly<number[]> = [];

    target: Readonly<Point>;

    constructor(
        mapDimensions: Readonly<Box>,
        viewportDimensions: Readonly<Box>,
        stepSize: number = 1.5,
        maxZoom: number = 4.0,
    ) {
        this._mapDimensions = mapDimensions;
        this._viewportDimensions = viewportDimensions;
        this._stepSize = stepSize;
        this._maxZoom = maxZoom;

        // Calculate zoom levels for the given viewport and map
        this._zoomLevels = this._calculateZoomLevels();

        // Set default zoom and centre the camera
        this._zoomIndex = this._zoomLevels.length - 1;
        this.target = {
            x: mapDimensions.width * 0.5,
            y: mapDimensions.height * 0.5,
        };
    }

    public getZoom(): number {
        const zoom = this._zoomLevels[this._zoomIndex];
        if (zoom === undefined)
            throw new Error("Invalid zoom level");
        return zoom;
    }

    /**
     * Update the camera's zoom level.
     *
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
        return this._zoomLevels[index]!;
    }

    /**
     * Return the current camera view box.
     *
     * The view box is the part of the map that is visible to the user.
     */
    public currentViewBox(): Readonly<ViewBox> {
        // Calculate the map area covered by the viewport
        const zoom = this.getZoom();
        const height = this._viewportDimensions.height / zoom;
        const width = this._viewportDimensions.width / zoom;
        // Calculate the edges of the viewport in map coordinates
        return {
            top: this.target.y + height * 0.5,
            right: this.target.x + width * 0.5,
            bottom: this.target.y - height * 0.5,
            left: this.target.x - width * 0.5,
        };
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
        const oldZoom = this.getZoom();
        const zoom = this.bumpZoom(value);
        // Calculate the viewport size change for the zoom level change
        const deltaX = (this._viewportDimensions.width / oldZoom)
            - (this._viewportDimensions.width / zoom);
        const deltaY = (this._viewportDimensions.height / oldZoom)
            - (this._viewportDimensions.height / zoom);
        // Bias the viewport change towards the fixed point
        const ratioX = -0.5 + viewportRelPos.x;
        const ratioY = +0.5 - viewportRelPos.y;  // TODO: Why is Y inverted?
        // Calculate the new camera target
        this.target = {
            x: Math.round(this.target.x + deltaX * ratioX),
            y: Math.round(this.target.y + deltaY * ratioY),
        };
        return this.target;
    }

    private _calculateZoomLevels(): Readonly<number[]> {
        // Find the minor axis of the viewport and the major axis of the map
        const minViewport = Math.min(
            this._viewportDimensions.width,
            this._viewportDimensions.height);
        const maxMap = Math.max(
            this._mapDimensions.width,
            this._mapDimensions.height);

        let zoomLevels: number[] = [this._maxZoom];

        // If the viewport has no area, disable zoom
        if (minViewport === 0)
            return zoomLevels;

        // Starting with the maximum zoom level, keep adding zoom levels until
        // the map is smaller than the viewport
        const factor = 1 / this._stepSize;
        let zoom = this._maxZoom;
        while (maxMap * zoom > minViewport) {
            zoom *= factor;
            const newZoom = Math.round((zoom + Number.EPSILON) * 100) / 100;
            zoomLevels.push(newZoom);
        }
        return zoomLevels;
    }
}