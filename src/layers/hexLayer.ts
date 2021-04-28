/**
 * Hex-tile map layer.
 *
 * This defines the logic required to draw and update the base outlines
 * for a given continent.
 */

/// <reference path="./base.ts" />

class HexLayer extends MapLayer {
    constructor(layer: HTMLDivElement, initialContinentId: number) {
        super(layer, initialContinentId);
    }

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

    private async getBaseHexes(
        continentId: number
    ): Promise<Array<SVGElement>> {
        const cont = getContinent(continentId);
        const elements = cont.then((contInfo) => {
            const svgs: Array<SVGElement> = [];
            for (const key in contInfo.map_base_svgs) {
                svgs.push(
                    elementFromString<SVGElement>(contInfo.map_base_svgs[key])
                );
            }
            return svgs;
        });
        return elements;
    }
}
