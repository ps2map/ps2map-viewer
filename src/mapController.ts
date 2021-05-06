/// <reference path="./zoom.ts" />

/**
 * This file handles the map object and its interactions.
 */

/**
 * Main controller for map interactions and rendering.
 */
class MapController extends Zoomable {
    // The zoomLevel is the amount of magnification relative to the
    // minimum map size, i.e. the map being completely zoomed out, with
    // its height and width being equal to the shorter axis of the
    // viewport.
    private continentId: number;
    readonly map: HTMLDivElement;

    constructor(
        map: HTMLDivElement,
        mapContainer: HTMLDivElement,
        viewport: HTMLDivElement,
        initialContinentId: number
    ) {
        super(mapContainer, viewport, 1.0);
        this.map = map;
        this.continentId = initialContinentId;
    }
}
