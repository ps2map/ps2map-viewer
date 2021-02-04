// This file defines map viewport controls like zoom and pan.


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