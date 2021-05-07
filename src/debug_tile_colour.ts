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
    const num = Math.round(Math.random() * 3);
    base.style.fill = ownershipColorsCSS[num];
    return num;
}
