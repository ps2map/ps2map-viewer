/// <reference path="mapController.ts" />

/**
 * Initialisation hook for code that must access the DOM.
 */
function onDOMLoaded(): void {
    const initialContinentId = 6;
    const map = <HTMLDivElement>document.getElementById("map");
    const viewport = <HTMLDivElement>document.getElementById("map-container");
    const mapContainer = <HTMLDivElement>(
        document.getElementById("map-background")
    );
    new MapController(map, mapContainer, viewport, initialContinentId);
}

window.addEventListener("DOMContentLoaded", onDOMLoaded);
