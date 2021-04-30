// This file defines map viewport controls like zoom and pan.

// Current map zoom level
let zoomLevel = 0.2;

/**
 * Hook to trigger map panning when the user clicks the map.
 *
 * To be registered for the `"mousedown"` event for the map container.
 * @param event The mouse click event
 */
function mapPanStart(event: MouseEvent): void {
    const map = <HTMLDivElement>document.getElementById("map");
    // Starting position of the dragging motion
    const initialOffsetLeft = map.offsetLeft;
    const initialOffsetTop = map.offsetTop;
    // Size of the viewport the map must be visible (and reachable) in
    const sizeX = map.clientWidth;
    const sizeY = map.clientHeight;

    /**
     * Continuous event callback for mouse movements while panning.
     *
     * To be temporarily registered for the `"mousemove"` event of the
     * map container for as long as the mouse is pressed.
     * @param dragEvent The mouse move event
     */
    function mapPanDrag(this: HTMLDivElement, dragEvent: MouseEvent): void {
        const deltaX = dragEvent.clientX - event.clientX;
        const deltaY = dragEvent.clientY - event.clientY;
        const newLeft = initialOffsetLeft + deltaX;
        const newTop = initialOffsetTop + deltaY;
        // Constraint motion so half of the map is still in frame
        /**
         * @todo: This is currently not taking zoom levels into account
         * and is generally sketchy. But it does prevent the map from
         * being lost in space and becoming undraggable, so it stays.
         */
        if (-sizeX < newLeft && newLeft < 0) {
            this.style.left = `${newLeft}px`;
        }
        if (-sizeY < newTop && newTop < 0) {
            this.style.top = `${newTop}px`;
        }
    }

    /**
     * Remove the map dragging event when the mouse is released.
     *
     * This is a single-shot event that will unregister itself as soon
     * as it triggers once.
     */
    function mapPanEnd(): void {
        map.removeEventListener("mousemove", mapPanDrag);
        document.removeEventListener("mouseup", mapPanEnd);
    }

    // Add the map panning event as the mouse was just pressed down
    map.addEventListener("mousemove", mapPanDrag);
    // Unregister the event as soon as the mouse is released
    document.addEventListener("mouseup", mapPanEnd);
}


/**
 * Adjust map zoom when scrolling.
 *
 * To be registered as the callback for the `"wheel"` event.
 * @param this The map frame to change size of
 * @param event The mouse wheel event
 */
function zoomMap(this: HTMLDivElement, event: WheelEvent): void {
    event.preventDefault()
    zoomLevel = event.deltaY < 0 ? zoomLevel * 1.2 : zoomLevel * 0.8;
    // Constrain zoom level
    if (zoomLevel < 0.1) {
        zoomLevel = 0.1;
    }
    else if (zoomLevel > 2.0) {
        zoomLevel = 2.0;
    }
    this.style.transform = `scale(${zoomLevel})`;
}


/**
 * Prevent selection of a container
 * @returns Always false
 */
function preventSelection(): boolean {
    return false;
}