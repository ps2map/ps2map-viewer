// Faction colours
const ownershipColorsCSS = [
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-NULL")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-NC")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-TR")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-VS")
        .trim(),
];

/**
 * Cycle the faction colours for a given SVG polygon.

 * @param base The SVG element (i.e. base polygon) that was clicked
 * @param event The original mouse click event.
 */
function cycleFactionColour(event: MouseEvent): void {
    if (!(event.target instanceof SVGElement)) {
        return;
    }
    if (event.button != 1) {
        return;
    }
    // Due to the base style being applied via a global CSS, base SVGs don't
    // start out with a specific colour.
    if (!event.target.style.fill) {
        event.target.style.fill = ownershipColorsCSS[0];
    }
    for (let i = 0; i < ownershipColorsCSS.length; i++) {
        if (event.target.style.fill == ownershipColorsCSS[i]) {
            if (i + 1 < ownershipColorsCSS.length) {
                event.target.style.fill = ownershipColorsCSS[i + 1];
            } else {
                event.target.style.fill = ownershipColorsCSS[0];
            }
            break;
        }
    }
}
