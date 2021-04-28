/// <reference path="./layers/baseNameLayer.ts" />
/// <reference path="./layers/hexLayer.ts" />
/// <reference path="./layers/tileLayer.ts" />

/**
 * Initialisation hook for code that must access the DOM.
 */
function onDOMLoaded(): void {
    const initialContinentId = 6;

    const hexLayerDiv = <HTMLDivElement>document.getElementById("mapHexLayer");
    const hexLayer = new HexLayer(hexLayerDiv, initialContinentId);
    const tileLayerDiv = <HTMLDivElement>(
        document.getElementById("mapTextureLayer")
    );
    const tileLayer = new TileLayer(tileLayerDiv, initialContinentId);
    const baseNameLayerDiv = <HTMLDivElement>(
        document.getElementById("mapBaseNameLayer")
    );
    // const baseNameLayer = new BaseNameLayer(
    //     baseNameLayerDiv,
    //     initialContinentId
    // );

    // Hook up map layer visibility toggles

    const showHideHexLayer = <HTMLInputElement>(
        document.getElementById("showHexes")
    );
    showHideHexLayer.addEventListener("click", () =>
        hexLayer.setVisibility(showHideHexLayer.checked)
    );
    const showHideTexturelayer = <HTMLInputElement>(
        document.getElementById("showMapTexture")
    );
    showHideTexturelayer.addEventListener("click", () =>
        tileLayer.setVisibility(showHideTexturelayer.checked)
    );
    // const showHideNameLayer = <HTMLInputElement>(
    //     document.getElementById("showBaseNames")
    // );
    // showHideNameLayer.addEventListener("click", () =>
    //     baseNameLayer.setVisibility(showHideNameLayer.checked)
    // );
}

window.addEventListener("DOMContentLoaded", onDOMLoaded);
