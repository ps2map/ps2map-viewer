/// <reference path="./amerish_svgs.ts" />
/// <reference path="./map_controls.ts" />
/// <reference path="./debug_tile_colour.ts" />


/**
 * Initialisation hook for code that must access the DOM.
 */
function onDOMLoaded(): void {

    // Map pan and zoom controls
    const map = <HTMLDivElement>document.getElementById("map");
    map.addEventListener("mousedown", mapPanStart);
    map.addEventListener("wheel", zoomMap);

    // Load map tiles    
    const viewport = <HTMLDivElement>document.getElementById("viewport");
    const textureLayer = <HTMLDivElement>document.getElementById("mapTextureLayer");
    new MapRenderer(viewport, textureLayer);

    // Load base outlines
    const hexesLayer = <HTMLDivElement>document.getElementById("mapHexLayer");
    hexesLayer.innerHTML = svg_strings

    // Prevent browser text selection of map layers
    map.addEventListener("selectstart", preventSelection);

    // Map layer visibility toggles
    const textureBtn = <HTMLInputElement>document.getElementById("showMapTexture");
    textureBtn.addEventListener("click", updateMapLayerVisibility(textureBtn, textureLayer));
    const hexesBtn = <HTMLInputElement>document.getElementById("showHexes");
    hexesBtn.addEventListener("click", updateMapLayerVisibility(hexesBtn, hexesLayer));

    // SVG colour switching via MMB (middle mouse button)
    document.addEventListener("auxclick", svgClickFilter);
}

window.addEventListener("DOMContentLoaded", onDOMLoaded);