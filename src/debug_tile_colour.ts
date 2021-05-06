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
    const style = base.parentElement?.parentElement?.style;
    if (style == null) {
        return 0;
    }
    const num = Math.round(Math.random() * 3);
    style.setProperty("--baseColour", ownershipColorsCSS[num]);
    return num;
}
