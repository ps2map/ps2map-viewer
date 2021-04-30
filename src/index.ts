/// <reference path="./amerish_svgs.ts" />
/// <reference path="./map_controls.ts" />

// Faction colours
const ownershipColorsCSS = [
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-NULL").trim(),
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-NC").trim(),
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-TR").trim(),
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-VS").trim()
];

// Setup code to run on page load
window.addEventListener("load", function (): void {
    const map = <HTMLDivElement>document.getElementById("map");
    map.addEventListener("mousedown", mapPanStart);
    map.addEventListener("wheel", zoomMap);
    // Hook up map layer controls
    const textureBtn = <HTMLInputElement>document.getElementById("showMapTexture");
    const textureLayer = <HTMLDivElement>document.getElementById("mapTextureLayer");
    textureBtn.addEventListener("click", updateMapLayerVisibility(textureBtn, textureLayer));
    const hexesBtn = <HTMLInputElement>document.getElementById("showHexes");
    const hexesLayer = <HTMLDivElement>document.getElementById("mapHexLayer");
    hexesBtn.addEventListener("click", updateMapLayerVisibility(hexesBtn, hexesLayer));
    // Load individual base SVGs
    hexesLayer.innerHTML = svg_strings;

    // Register event listeners for base SVGs (the callback filters for SVGs)
    document.addEventListener("click", svgClickFilter);
});


/**
 * Change the visibility of a map layer according to a checkbox.
 *
 * The container"s `.style.display` attribute will be set to `"block"`
 * or `"none"` depending on whether the checkbox is checked or not.
 * @param checkbox The checkbox to check the state of
 * @param layer The HTML container to alter visibility of
 * @returns Callback to register for the checkbox"s `"clicked"` event
 */
function updateMapLayerVisibility(checkbox: HTMLInputElement, layer: HTMLDivElement): () => void {
    return function (): void {
        layer.style.display = checkbox.checked ? "block" : "none";
    }
}


/**
 * Dispatch the faction colour cycler for any SVG elements clicked.
 * 
 * Due to the way SVGs work, this will actually pass the polygon that
 * was clicked, not the SVG itself.
 * @param event The mouse click event
 */
function svgClickFilter(event: MouseEvent): void {
    if (!(event.target instanceof SVGElement)) {
        return;
    }
    cycleFactionColour(event.target, event);
}


/**
 * Cycle the faction colours for a given SVG polygon.

 * @param base The SVG element (i.e. base polygon) that was clicked
 * @param event The original mouse click event.
 */
function cycleFactionColour(base: SVGElement, event: MouseEvent): void {
    // Set the initial colour value
    // Due to the way the styles are applied, base polygons don"t have
    // a specific colour, which is why this exists.
    if (!base.style.fill) {
        base.style.fill = ownershipColorsCSS[0];
    }
    for (let i = 0; i < ownershipColorsCSS.length; i++) {
        if (base.style.fill == ownershipColorsCSS[i]) {
            if (i + 1 < ownershipColorsCSS.length) {
                base.style.fill = ownershipColorsCSS[i + 1];
            }
            else {
                base.style.fill = ownershipColorsCSS[0];
            }
            break;
        }
    }
}