// Faction colours
const ownershipColorsCSS = [
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-NULL")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-VS")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-NC")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-TR")
        .trim(),
];

/**
 * Cycle the faction colours for a given SVG polygon.
 * @param base The base element that was clicked.
 * @returns The faction ID of the new owner.
 */
function cycleFactionColour(base: SVGElement): number {
    // Due to the base style being applied via a global CSS, base SVGs don't
    // start out with a specific colour.
    if (!base.style.fill) {
        base.style.fill = ownershipColorsCSS[0];
    }
    for (let i = 0; i < ownershipColorsCSS.length; i++) {
        if (base.style.fill == ownershipColorsCSS[i]) {
            if (i + 1 < ownershipColorsCSS.length) {
                base.style.fill = ownershipColorsCSS[i + 1];
                return i + 1;
            } else {
                base.style.fill = ownershipColorsCSS[0];
                return 0;
            }
        }
    }
    return 0;
}
