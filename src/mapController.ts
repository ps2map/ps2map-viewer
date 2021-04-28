/**
 * This module handles map rendering and interaction.
 *
 * This covers continent switches, toggling layer visbility, as well as
 * zoom and pan controls for touch and mouse.
 */

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

        function mouseDrag(evtDrag: MouseEvent): void {
            const deltaX = evtDrag.clientX - evtDown.clientX;
            const deltaY = evtDrag.clientY - evtDown.clientY;
            // TODO: Move this to another handler to allow parallel zoom
            // and drag
            viewport.scrollLeft = initialScrollLeft - deltaX;
            viewport.scrollTop = initialScrollTop - deltaY;
        }
        function mouseUp(): void {
            map.removeEventListener("mousemove", mouseDrag);
            document.removeEventListener("mouseup", mouseUp);
        }
        map.addEventListener("mousemove", mouseDrag);
        document.addEventListener("mouseup", mouseUp);
    }
}
