/**
 * This module handles map rendering and interaction.
 *
 * This covers continent switches, toggling layer visbility, as well as
 * zoom and pan controls for touch and mouse.
 */

const zoomLevels: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Main controller for map interactions and rendering.
 */
class MapController {
    // The zoomLevel is the amount of magnification relative to the
    // minimum map size, i.e. the map being completely zoomed out, with
    // its height and width being equal to the shorter axis of the
    // viewport.
    private zoomLevel: number;
    private continentId: number;
    readonly map: HTMLDivElement;
    readonly viewport: HTMLDivElement;
    public onZoom: Array<(newZoomLevel: number) => void> = [];
    private zoomAnimFrameScheduled: boolean = false;

    constructor(
        map: HTMLDivElement,
        viewport: HTMLDivElement,
        initialContinentId: number
    ) {
        this.continentId = initialContinentId;
        this.map = map;
        this.viewport = viewport;
        this.zoomLevel = 1.0;
        map.addEventListener("mousedown", this.mousePan.bind(this));
        map.addEventListener("wheel", this.mouseWheel.bind(this), {
            passive: false,
        });
        map.addEventListener("touchstart", this.pinchZoom.bind(this), {
            passive: true,
        });
    }

    /**
     * Bump the zoom level by one.
     * @param increase If true, increase zoom level (+), otherwise
     * reduce it (-).
     */
    public incDecZoom(increase: boolean) {
        let zoomLevel = this.zoomLevel;
        const index = zoomLevels.indexOf(this.zoomLevel);
        if (index < 0) {
            // Zoom level is an odd value, jump to the next fixed value
            for (let i = 0; i < zoomLevels.length; i++) {
                const refLevel = zoomLevels[i];
                if (refLevel > this.zoomLevel) {
                    if (increase) {
                        zoomLevel = refLevel;
                        break;
                    }
                    // When decrementing, we want to jump to the next
                    // level that is smaller, so we take the one before
                    zoomLevel = zoomLevels[i - 1];
                    break;
                }
            }
        } else {
            // Zoom level is a fixed value, modify by 1
            zoomLevel += increase ? 1 : -1;
        }
        if (this.zoomAnimFrameScheduled) {
            return;
        }
        this.zoomAnimFrameScheduled = true;
        requestAnimationFrame(() => {
            this.applyZoomLevel(zoomLevel);
            this.zoomAnimFrameScheduled = false;
        });
    }

    /**
     * Event listener callback for LMB dragging on the map.
     *
     * This is only registered for the mouse pointer type as the map
     * itself is scrollable by touch devices.
     * @param evtDown The mousedown event received
     */
    private mousePan(evtDown: MouseEvent): void {
        // LMB only
        if (evtDown.button != 0) {
            return;
        }
        const viewport = this.viewport;
        const map = this.map;
        const initialScrollLeft = viewport.scrollLeft;
        const initialScrollTop = viewport.scrollTop;
        let nextScrollTargetLeft = 0.0;
        let nextScrollTargetTop = 0.0;
        let animFrameScheduled = false;

        function mouseDrag(evtDrag: MouseEvent): void {
            const deltaX = evtDrag.clientX - evtDown.clientX;
            const deltaY = evtDrag.clientY - evtDown.clientY;
            nextScrollTargetLeft = initialScrollLeft - deltaX;
            nextScrollTargetTop = initialScrollTop - deltaY;
            if (animFrameScheduled) {
                return;
            }
            animFrameScheduled = true;
            requestAnimationFrame(() => {
                viewport.scrollLeft = nextScrollTargetLeft;
                viewport.scrollTop = nextScrollTargetTop;
                animFrameScheduled = false;
            });
        }

        function mouseUp(): void {
            map.removeEventListener("mousemove", mouseDrag);
            document.removeEventListener("mouseup", mouseUp);
        }

        map.addEventListener("mousemove", mouseDrag);
        document.addEventListener("mouseup", mouseUp);
    }

    /**
     * Constrain the given value within the valid zoom level range.
     * @param value The value to constrain
     * @returns The given value clamped within the zoom limits
     */
    private constrainZoom(value: number): number {
        let zoomLevel = value;
        if (zoomLevel < 1.0) {
            zoomLevel = 1.0;
        } else if (zoomLevel > 12.0) {
            zoomLevel = 12.0;
        }
        return zoomLevel;
    }

    /**
     * Apply the new zoom level.
     * This includes firing any onZoom callbacks, as well as the
     * scaling of the map itself.
     * @param zoomLevel The new zoom level to apply
     * @param relX Relative screen position towards which to zoom
     * @param relY Relative screen position towards which to zoom
     */
    private applyZoomLevel(
        zoomLevel: number,
        relX: number = 0.5,
        relY: number = 0.5
    ): void {
        const vport = this.viewport;
        // Viewport-relative scroll target
        const screenX = relX * vport.clientWidth;
        const screenY = relY * vport.clientHeight;
        const newZoom = this.constrainZoom(zoomLevel);
        const zoomDelta = newZoom / this.zoomLevel;
        // Shift scroll position for new zoom level and target
        const relScrollX = (screenX + vport.scrollLeft) * zoomDelta;
        const relScrollY = (screenY + vport.scrollTop) * zoomDelta;
        const scrollLeft = relScrollX - screenX;
        const scrollTop = relScrollY - screenY;
        // Another shift to compensate for the map scaling
        const offset = (newZoom - 1.0) * 50.0;
        this.zoomLevel = newZoom;
        vport.scrollLeft = scrollLeft;
        vport.scrollTop = scrollTop;
        this.map.style.transform =
            `translate3D(${offset}%, ${offset}%, 0) ` +
            `scale(${this.zoomLevel})`;
        this.zoomDispatch();
    }

    /**
     * Event listener callback for mouse scroll.
     */
    private mouseWheel(evt: WheelEvent): void {
        evt.preventDefault();
        let deltaY = evt.deltaY;
        if (evt.deltaMode == 0) {
            deltaY /= 80;
        }
        const relX = evt.clientX / this.viewport.clientWidth;
        const relY = evt.clientY / this.viewport.clientHeight;
        if (this.zoomAnimFrameScheduled) {
            return;
        }
        this.zoomAnimFrameScheduled = true;
        requestAnimationFrame(() => {
            this.applyZoomLevel(this.zoomLevel - deltaY * 0.25, relX, relY);
            this.zoomAnimFrameScheduled = false;
        });
    }

    /**
     * Dispatch the current zoom level to all registered callbacks.
     */
    private zoomDispatch(): void {
        this.onZoom.forEach((callback) => {
            callback(this.zoomLevel);
        });
    }

    /**
     * Return the midpoint of a touch gesture.
     * @param touches The TouchList received from the event
     * @returns A tuple of the average clientX and clientY location
     */
    private getTouchesCenter(touches: TouchList): [number, number] {
        let avgX = 0.0;
        let avgY = 0.0;
        if (touches.length == 0) {
            return [NaN, NaN];
        }
        for (let i = 0; i < touches.length; i++) {
            const touch = <Touch>touches.item(i);
            avgX += touch.clientX;
            avgY += touch.clientY;
        }
        avgX /= touches.length;
        avgY /= touches.length;
        return [avgX, avgY];
    }

    /**
     * Return the straight lien distance between two touch points.
     * @param touches The TouchList object received from the event
     * @returns The cartesian distance between the two touch points
     * @throws Error if the TouchList's length is not exactly 2
     */
    private getTouchesDistance(touches: TouchList): number {
        if (touches.length != 2) {
            throw "distance only valid between two points";
        }
        const pt1 = <Touch>touches.item(0);
        const pt2 = <Touch>touches.item(1);
        return Math.sqrt(
            (pt2.clientX - pt1.clientX) ** 2 + (pt2.clientY - pt1.clientY) ** 2
        );
    }

    /**
     * Event handler for pinch zoom controls
     * @param evt The initial touchdown event received
     */
    private pinchZoom(evt: TouchEvent): void {
        if (evt.touches.length != 2) {
            return;
        }
        const con = this;
        const touchStartDist = this.getTouchesDistance(evt.touches);
        const zoomStart = this.zoomLevel;

        function touchMove(evt: TouchEvent): void {
            if (evt.touches.length != 2) {
                return;
            }
            const touchCenter = con.getTouchesCenter(evt.touches);
            const touchDist = con.getTouchesDistance(evt.touches);
            const distRel = touchDist / touchStartDist;

            if (con.zoomAnimFrameScheduled) {
                return;
            }
            const relX = touchCenter[0] / con.viewport.clientWidth;
            const relY = touchCenter[1] / con.viewport.clientHeight;
            con.zoomAnimFrameScheduled = true;
            requestAnimationFrame(() => {
                con.applyZoomLevel(zoomStart * distRel, relX, relY);
                con.zoomAnimFrameScheduled = false;
            });
        }

        function touchEnd(evt: TouchEvent): void {
            con.map.removeEventListener("touchmove", touchMove);
            con.map.removeEventListener("touchend", touchEnd);
            con.map.removeEventListener("touchcancel", touchEnd);
        }

        con.map.addEventListener("touchmove", touchMove, {
            passive: true,
        });
        con.map.addEventListener("touchend", touchEnd);
        con.map.addEventListener("touchcancel", touchEnd);
    }
}
