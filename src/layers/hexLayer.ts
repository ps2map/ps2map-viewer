/**
 * Hex-tile map layer.
 *
 * This defines the logic required to draw and update the base outlines
 * for a given continent.
 */

/// <reference path="./base.ts" />

/**
 * MapLayer subclass used to draw base outlines on the map.
 */
class HexLayer extends MapLayer {
    public baseHoverCallback: (arg0: number) => void = () => null;

    constructor(layer: HTMLDivElement, initialContinentId: number) {
        super(layer, initialContinentId);
    }

    /**
     * Switch the currently active continent.
     * @param continentId ID of the new continent to display.
     */
    public setContinent(continentId: number): void {
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        // Get the base outline SVGs for this continent
        const outlines = this.getBaseHexes(continentId);
        outlines.then((elements) => {
            this.clear();
            elements.forEach((child) => this.layer.appendChild(child));
        });
    }

    /**
     * Retrieve the base outline SVGs for the given continent.
     *
     * Note that all returned SVG elements will have a view box size of
     * 8192 x 8192 px. When using absolute positioning, this ensures
     * that all outlines are correctly positioned relative to each
     * other.
     * @param continentId The ID of the continent.
     * @returns An array of SVG elements.
     */
    private async getBaseHexes(
        continentId: number
    ): Promise<Array<HTMLElement>> {
        const cont = getContinent(continentId);
        const elements = cont.then((contInfo) => {
            const svgs: Array<HTMLElement> = [];
            for (const key in contInfo.map_base_svgs) {
                const hex = document.createElement("div");
                hex.classList.add("baseHex");
                const hexBg = elementFromString<SVGElement>(
                    contInfo.map_base_svgs[key]
                );
                hexBg.classList.add("baseHexBg");
                hex.appendChild(hexBg);
                const hexFg = elementFromString<SVGElement>(
                    contInfo.map_base_svgs[key]
                );
                hexFg.classList.add("baseHexFg");
                this.registerHoverCallback(hexBg);
                hex.appendChild(hexFg);
                svgs.push(hex);
            }
            return svgs;
        });
        return elements;
    }

    /**
     * Helper function for triggering mouseover event listeners.
     *
     * A mouseover event on the given element will run the callback
     * defined in the HexLayer.baseHoverCallback property.
     * @param element The SVG element to attach a listener to.
     */
    private registerHoverCallback(element: SVGElement): void {
        element.addEventListener("mouseover", (evt) => {
            // Only call hover callbacks if no mouse button is pressed
            if (evt.buttons % 4 > 0) {
                return;
            }
            this.baseHoverCallback(parseInt(element.id));
        });
    }
}
