/// <reference path="./api/getters.ts" />
/// <reference path="./layers/baseNameLayer.ts" />
/// <reference path="./layers/hexLayer.ts" />
/// <reference path="./layers/tileLayer.ts" />
/// <reference path="./debug_tile_colour.ts" />

/**
 * Initialisation hook for code that must access the DOM.
 */
function onDOMLoaded(): void {
    const initialContinentId = 6;

    // Add map layers

    const hexLayerDiv = <HTMLDivElement>document.getElementById("layer-hexes");
    const hexLayer = new HexLayer(hexLayerDiv, initialContinentId);
    const tileLayerDiv = <HTMLDivElement>(
        document.getElementById("layer-terrain")
    );
    const tileUrl = "http://127.0.0.1:5000/static/tile/";
    const tileLayer = new TileLayer(tileLayerDiv, initialContinentId, tileUrl);
    const baseNameLayerDiv = <HTMLDivElement>(
        document.getElementById("layer-names")
    );
    const baseNameLayer = new BaseNameLayer(
        baseNameLayerDiv,
        initialContinentId
    );

    // Create map controller

    const map = <HTMLDivElement>document.getElementById("map");
    const viewport = <HTMLDivElement>document.getElementById("map-container");
    const mapContainer = <HTMLDivElement>(
        document.getElementById("map-background")
    );
    const controller = new MapController(
        map,
        mapContainer,
        viewport,
        initialContinentId
    );
    controller.registerZoomCallback(tileLayer.onZoom.bind(tileLayer));
    controller.registerZoomCallback(baseNameLayer.onZoom.bind(baseNameLayer));

    // Debug base painter
    hexLayer.layer.addEventListener("auxclick", (evt: MouseEvent) => {
        if (!(evt.target instanceof SVGPolygonElement) || evt.button != 1) {
            return;
        }
        baseNameLayer.setBaseOwnership(
            parseInt(evt.target.id),
            cycleFactionColour(evt.target)
        );
    });
}

window.addEventListener("DOMContentLoaded", onDOMLoaded);
