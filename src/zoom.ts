type ZoomCallback = (zoomLevel: number) => void;
const zoomLevels: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

class Zoomable {
    readonly target: HTMLElement;
    private container: HTMLElement;
    private zoom: number;
    private onZoom: Array<ZoomCallback> = [];
    private animFrameScheduled: boolean = false;

    constructor(
        content: HTMLElement,
        container: HTMLElement,
        initialZoom: number = 1.0
    ) {
        this.target = content;
        this.container = container;
        this.zoom = initialZoom;

        content.addEventListener("mousedown", this.mousePan.bind(this));
        content.addEventListener("wheel", this.mouseWheel.bind(this), {
            passive: false,
        });
        content.addEventListener("touchstart", this.pinchZoom.bind(this), {
            passive: true,
        });
    }

    /**
     * The given function will be called as part of the animation frame
     * requested as part of the zoom update. Be wary of performance, a
     * slow zoom callback will slow down the touch navigation.
     *
     * Due to the animation frame, this is already debounced to only
     * one call per frame.
     * @param callback A function to call when the zoom level changes.
     */
    public registerZoomCallback(callback: ZoomCallback): void {
        this.onZoom.push(callback);
    }

    /**
     * Remove an existing zoom callback. See the registerZoomCallback
     * method for details; this simply removes the callback if it was
     * previously added. If the callback does not exist, it will be
     * silently ignored.
     * @param callback An existing callback to remove.
     */
    public unregisterZoomCallback(callback: ZoomCallback): void {
        for (let i = 0; i < this.onZoom.length; i++) {
            if (this.onZoom[i] == callback) {
                this.onZoom.splice(i);
                return;
            }
        }
    }

    /**
     * Bump the zoom level by one.
     * @param increase If true, increase zoom level (+), otherwise
     * reduce it (-).
     */
    public incDecZoom(increase: boolean) {
        let zoomLevel = this.zoom;
        const index = zoomLevels.indexOf(this.zoom);
        if (index < 0) {
            // Zoom level is an odd value, jump to the next fixed value
            for (let i = 0; i < zoomLevels.length; i++) {
                const refLevel = zoomLevels[i];
                if (refLevel > this.zoom) {
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
        if (this.animFrameScheduled) {
            return;
        }
        this.animFrameScheduled = true;
        requestAnimationFrame(() => {
            this.applyZoomLevel(zoomLevel);
            this.animFrameScheduled = false;
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
        const container = this.container;
        const element = this.target;
        const initialScrollLeft = container.scrollLeft;
        const initialScrollTop = container.scrollTop;
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
                container.scrollLeft = nextScrollTargetLeft;
                container.scrollTop = nextScrollTargetTop;
                animFrameScheduled = false;
            });
        }

        function mouseUp(): void {
            element.removeEventListener("mousemove", mouseDrag);
            document.removeEventListener("mouseup", mouseUp);
        }

        element.addEventListener("mousemove", mouseDrag);
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
        const vport = this.container;
        // Viewport-relative scroll target
        const screenX = relX * vport.clientWidth;
        const screenY = relY * vport.clientHeight;
        const newZoom = this.constrainZoom(zoomLevel);
        const zoomDelta = newZoom / this.zoom;
        // Shift scroll position for new zoom level and target
        const relScrollX = (screenX + vport.scrollLeft) * zoomDelta;
        const relScrollY = (screenY + vport.scrollTop) * zoomDelta;
        const scrollLeft = relScrollX - screenX;
        const scrollTop = relScrollY - screenY;
        // Another shift to compensate for the map scaling
        const offset = (newZoom - 1.0) * 50.0;
        this.zoom = newZoom;
        this.target.style.transform =
            `translate3D(${offset}%, ${offset}%, 0) ` + `scale(${this.zoom})`;
        vport.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: "auto",
        });
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
        const relX = evt.clientX / this.container.clientWidth;
        const relY = evt.clientY / this.container.clientHeight;
        if (this.animFrameScheduled) {
            return;
        }
        this.animFrameScheduled = true;
        requestAnimationFrame(() => {
            this.applyZoomLevel(this.zoom - deltaY * 0.25, relX, relY);
            this.animFrameScheduled = false;
        });
    }

    /**
     * Dispatch the current zoom level to all registered callbacks.
     */
    private zoomDispatch(): void {
        this.onZoom.forEach((callback) => {
            callback(this.zoom);
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
        const zoomStart = this.zoom;

        function touchMove(evt: TouchEvent): void {
            if (evt.touches.length != 2) {
                return;
            }
            const touchCenter = con.getTouchesCenter(evt.touches);
            const touchDist = con.getTouchesDistance(evt.touches);
            const distRel = touchDist / touchStartDist;

            if (con.animFrameScheduled) {
                return;
            }
            const relX = touchCenter[0] / con.container.clientWidth;
            const relY = touchCenter[1] / con.container.clientHeight;
            con.animFrameScheduled = true;
            requestAnimationFrame(() => {
                con.applyZoomLevel(zoomStart * distRel, relX, relY);
                con.animFrameScheduled = false;
            });
        }

        function touchEnd(evt: TouchEvent): void {
            con.target.removeEventListener("touchmove", touchMove);
            document.removeEventListener("touchend", touchEnd);
            document.removeEventListener("touchcancel", touchEnd);
        }

        con.target.addEventListener("touchmove", touchMove, {
            passive: true,
        });
        document.addEventListener("touchend", touchEnd);
        document.addEventListener("touchcancel", touchEnd);
    }
}
