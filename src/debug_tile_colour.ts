// Faction colours
const ownershipColorsCSS = [
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-NULL").trim(),
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-NC").trim(),
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-TR").trim(),
    getComputedStyle(document.documentElement).getPropertyValue("--COLOR-FG-CAPPED-VS").trim()
];


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
    if (event.button == 1) {
        cycleFactionColour(event.target, event);
    }
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