/// <reference path="./map.ts" />
/// <reference path="./debug_tile_colour.ts" />


/**
 * Initialisation hook for code that must access the DOM.
 */
function onDOMLoaded(): void {

    const map = <HTMLDivElement>document.getElementById("map");
    const viewport = <HTMLDivElement>document.getElementById("viewport");

    // Initialise map
    const renderer = new MapRenderer(viewport, map, "amerish");

    // Hook up map layer visibility toggles
    renderer.layerVisibilityHook("mapTextureLayer", "showMapTexture");
    renderer.layerVisibilityHook("mapHexLayer", "showHexes");
    renderer.layerVisibilityHook("mapBaseNameLayer", "showBaseNames");

    /*********** Debug ***********/

    // SVG colour switching via MMB (middle mouse button)
    document.addEventListener("auxclick", svgClickFilter);
}

window.addEventListener("DOMContentLoaded", onDOMLoaded);