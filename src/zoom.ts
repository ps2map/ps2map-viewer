/**
 * This file handles zoom and pan controls for the map.
 *
 * It defines the Zoomable class, which allows zooming and panning
 * a target object within a given container. This includes keyboard
 * controls like mouse or keyboard, touch events, and hooks for
 * attaching custom compatibility hooks.
 */

/* Type aliases */
type ZoomCallback = (zoomLevel: number) => void;

/**
 * Brains for a zoomable container.
 *
 * The container is the object within which the scrolling is performed,
 * target is the object that is scrolled.
 */
class Zoomable {
    readonly target: HTMLElement;
    private container: HTMLElement;
    private zoom: number;
    private minZoom: number;
    private maxZoom: number;
    private onZoom: Array<ZoomCallback> = [];
    private scrollDistY: number = 0.0;
    private lastScrollCursor: [number, number] = [0.0, 0.0];
    private rafPending: boolean = false;

    constructor(
        content: HTMLElement,
        container: HTMLElement,
        initialZoom: number = 1.0,
        minZoom: number = 1.0,
        maxZoom: number = 10.0
    ) {
        this.target = content;
        this.container = container;
        this.zoom = initialZoom;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;

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
     * Change the current zoom level by one increment. Call this as
     * part of a button event listener to implement manual zoom control
     * buttons.
     * @param increase If true, increase zoom level (+), otherwise
     * reduce it (-).
     */
    public bumpZoomLevel(increase: boolean) {
        let zoomLevel = this.zoom;
        const zoomLevels: Array<number> = Array();
        for (let i = this.minZoom; i < this.maxZoom; i++) {
            zoomLevels.push(i);
        }
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
        if (this.rafPending) {
            return;
        }
        this.rafPending = true;
        requestAnimationFrame(() => {
            this.applyZoomLevel(zoomLevel);
            this.rafPending = false;
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
        if (evtDown.button != 0) {
            return;
        }
        const self = this;
        const container = this.container;
        const element = this.target;
        const initialScrollLeft = container.scrollLeft;
        const initialScrollTop = container.scrollTop;

        function mouseDrag(evtDrag: MouseEvent): void {
            if (self.rafPending) {
                return;
            }
            requestAnimationFrame(() => {
                const deltaX = evtDrag.clientX - evtDown.clientX;
                const deltaY = evtDrag.clientY - evtDown.clientY;
                container.scrollLeft = initialScrollLeft - deltaX;
                container.scrollTop = initialScrollTop - deltaY;
                self.rafPending = false;
            });
            self.rafPending = true;
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
        if (zoomLevel < this.minZoom) {
            zoomLevel = this.minZoom;
        } else if (zoomLevel > this.maxZoom) {
            zoomLevel = this.maxZoom;
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
        this.invokeZoomCallbacks();
    }

    /**
     * Event listener callback for mouse scroll.
     */
    private mouseWheel(evt: WheelEvent): void {
        evt.preventDefault();
        this.lastScrollCursor = [evt.clientX, evt.clientY];
        let deltaY = evt.deltaY;
        if (evt.deltaMode == 0) {
            deltaY *= 0.0125; // Trial-and-error scaling factor
        }
        this.scrollDistY = deltaY * 0.4;
        if (this.rafPending) {
            return;
        }
        requestAnimationFrame(() => {
            const relX = this.lastScrollCursor[0] / this.container.clientWidth;
            const relY = this.lastScrollCursor[1] / this.container.clientHeight;
            /** @HACK This is pretty jank but it adjusts the zoom level to be
             * properly spaced both ways:
             * 0.9 * 1.1 != 1.0, but 0.909090... * 1.1 = 1.0
             *
             * It's not elegant or all that fast, but it's good enough for
             * testing.
             */
            let zoomRel = 1 + this.scrollDistY * 0.2;
            if (zoomRel < 1) {
                zoomRel = 1 / zoomRel;
            } else {
                zoomRel = 2 - zoomRel;
            }
            this.applyZoomLevel(this.zoom * zoomRel, relX, relY);
            this.scrollDistY = 0.0;
            this.rafPending = false;
        });
        this.rafPending = true;
    }

    /**
     * Run any registered zoom level callbacks. The callables expect
     * this call to occur during an animation frame.
     */
    private invokeZoomCallbacks(): void {
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
            if (con.rafPending) {
                return;
            }
            if (evt.touches.length != 2) {
                return;
            }
            requestAnimationFrame(() => {
                const touchCenter = con.getTouchesCenter(evt.touches);
                const touchDist = con.getTouchesDistance(evt.touches);
                const distRel = touchDist / touchStartDist;
                const relX = touchCenter[0] / con.container.clientWidth;
                const relY = touchCenter[1] / con.container.clientHeight;
                con.applyZoomLevel(zoomStart * distRel, relX, relY);
                con.rafPending = false;
            });
            con.rafPending = true;
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
