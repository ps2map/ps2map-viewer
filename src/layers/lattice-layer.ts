/// <reference path="../interfaces/index.ts" />
/// <reference path="../rest/index.ts" />
/// <reference path="../map-engine/map-layer.ts" />
/// <reference path="./base.ts" />

/** A static layer rendering lattice links for a given continent. */
class LatticeLayer extends StaticLayer implements SupportsBaseOwnership {

    private _links: LatticeLink[] = [];

    private constructor(id: string, size: Box) {
        super(id, size);
        this.element.classList.add("ps2map__lattice");
    }

    static async factory(continent: Continent, id: string,
    ): Promise<LatticeLayer> {
        return fetchContinentLattice(continent.id)
            .then(links => {
                const size = {
                    width: continent.map_size,
                    height: continent.map_size,
                };
                const layer = new LatticeLayer(id, size);
                layer._links = links;
                layer.element.innerHTML = "";
                layer.element.appendChild(layer._createLatticeSvg());
                return layer;
            });
    }

    public updateBaseOwnership(map: Map<number, number>): void {
        map.forEach((_, baseId) => {
            // For each base, get the links that connect to it
            const links = this._links.filter(
                l => l.base_a_id === baseId || l.base_b_id === baseId);
            // For each link, check the ownership of its adjacent bases
            links.forEach(link => {
                const ownerA = map.get(link.base_a_id);
                const ownerB = map.get(link.base_b_id);

                // Retrieve the SVG element of the link
                const id = `#lattice-link-${link.base_a_id}-${link.base_b_id}`;
                const element = this.element.querySelector<SVGLineElement>(id);
                if (element) {
                    // Link to disabled base (greyed out)
                    let colour = "var(--ps2map__lattice-disabled)";
                    if (ownerA === undefined || ownerB === undefined) {
                        // Keep at default (disabled)
                    } else if (ownerA === ownerB) {
                        // If both bases are owned by the same non-neutral
                        // faction, use the faction's colour
                        if (ownerA !== 0)
                            colour = `var(${this._factionIdToCssVar(ownerA)})`;
                    } else if (ownerA !== 0 && ownerB !== 0) {
                        // If the bases are owned by different non-neutral
                        // factions, flag is as contested
                        colour = "var(--ps2map__lattice-contested)";
                    }
                    element.style.stroke = colour;
                }
            });
        });
    }

    /** Create an empty SVG element to place lattice links into. */
    private _createLatticeSvg(): SVGElement {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg", "svg");
        svg.setAttribute(
            "viewBox", `0 0 ${this.size.width} ${this.size.height}`);
        this._links.forEach(link => {
            svg.appendChild(this._createLatticeLink(link));
        });
        return svg;
    }

    /** Create a lattice link for the contained SVG element. */
    private _createLatticeLink(link: LatticeLink): SVGElement {
        const path = document.createElementNS(
            "http://www.w3.org/2000/svg", "line");
        path.setAttribute(
            "id", `lattice-link-${link.base_a_id}-${link.base_b_id}`);

        // Game and database use inverted Y coordinates
        const offsetX = this.size.width * 0.5;
        const offsetY = this.size.height * 0.5;
        path.setAttribute("x1", (link.map_pos_a_x + offsetX).toFixed());
        path.setAttribute("y1", (-link.map_pos_a_y + offsetY).toFixed());
        path.setAttribute("x2", (link.map_pos_b_x + offsetX).toFixed());
        path.setAttribute("y2", (-link.map_pos_b_y + offsetY).toFixed());
        return path;
    }

    /**
     * Return the CSS variable name for the given faction.
     *
    * @param factionId - The faction ID to get the colour for.
    * @returns The CSS variable name for the faction's colour.
     */
    private _factionIdToCssVar(factionId: number): string {
        // TODO: This function is identical to the one in hex-layer.ts, but a
        // shared inheritance is not trivial - to be revisited.
        const code = GameData.getInstance().getFaction(factionId).code;
        return `--ps2map__faction-${code}-colour`;
    }
}
