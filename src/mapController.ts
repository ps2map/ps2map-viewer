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
        this.applyZoomLevel(zoomLevel);
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
        let isScheduled = false;
        function mouseDrag(evtDrag: MouseEvent): void {
            const deltaX = evtDrag.clientX - evtDown.clientX;
            const deltaY = evtDrag.clientY - evtDown.clientY;
            // TODO: Move this to another handler to allow parallel zoom
            // and drag
            nextScrollTargetLeft = initialScrollLeft - deltaX;
            nextScrollTargetTop = initialScrollTop - deltaY;
            function mousePanAnimationCallback(start: DOMHighResTimeStamp) {
                viewport.scrollLeft = nextScrollTargetLeft;
                viewport.scrollTop = nextScrollTargetTop;
            }
            if (isScheduled) {
                requestAnimationFrame(mousePanAnimationCallback);
            }
            isScheduled = true;
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
        evt.preventDefault(); // Prevent vertical scrolling
        let deltaY = evt.deltaY;
        if (evt.deltaMode == 0) {
            deltaY /= 80;
        }
        const relX = evt.clientX / this.viewport.clientWidth;
        const relY = evt.clientY / this.viewport.clientHeight;
        this.applyZoomLevel(this.zoomLevel - deltaY * 0.25, relX, relY);
    }

    /**
     * Dispatch the current zoom level to all registered callbacks.
     */
    private zoomDispatch(): void {
        this.onZoom.forEach((callback) => {
            callback(this.zoomLevel);
        });
    }
}
