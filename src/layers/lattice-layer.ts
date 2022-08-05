/// <reference path="../interfaces/index.ts" />
/// <reference path="../rest/index.ts" />
/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

/** A static layer rendering lattice links for a given continent. */
class LatticeLayer extends StaticLayer implements SupportsBaseOwnership {

    private _links: LatticeLink[] = [];

    private constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__lattice");
    }

    static async factory(continent: Continent, id: string
    ): Promise<LatticeLayer> {
        return fetchContinentLattice(continent.id)
            .then(links => {
                const layer = new LatticeLayer(id, continent.map_size);
                layer._links = links;
                layer.element.innerHTML = "";
                layer.element.appendChild(layer._createLatticeSvg());
                return layer;
            });
    }

    public updateBaseOwnership(baseOwnershipMap: Map<number, number>): void {

        const colours: any = {
            0: "rgba(0, 0, 0, 0.25)",
            1: "rgba(120, 37, 143, 1.0)",
            2: "rgba(41, 83, 164, 1.0)",
            3: "rgba(186, 25, 25, 1.0)",
            4: "rgba(50, 50, 50, 1.0)",
        };

        baseOwnershipMap.forEach((_, baseId) => {
            // For each base, get the links that connect to it
            const links = this._links.filter(
                l => l.base_a_id === baseId || l.base_b_id === baseId);
            // For each link, check the ownership of its adjacent bases
            links.forEach(link => {
                const ownerA = baseOwnershipMap.get(link.base_a_id);
                const ownerB = baseOwnershipMap.get(link.base_b_id);
                if (!ownerA || !ownerB)
                    return;

                // Retrieve the SVG element of the link
                const id = `#lattice-link-${link.base_a_id}-${link.base_b_id}`;
                const element = this.element.querySelector<SVGLineElement>(id);
                if (element)
                    if (ownerA === ownerB)
                        element.style.stroke = colours[ownerA];
                    else if (ownerA === 0 || ownerB === 0)
                        element.style.stroke = colours[0];
                    else
                        element.style.stroke = "orange";
            });
        });
    }

    /** Create an empty SVG element to place lattice links into. */
    private _createLatticeSvg(): SVGElement {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${this.mapSize} ${this.mapSize}`);
        this._links.forEach(link => {
            svg.appendChild(this._createLatticeLink(link));
        });
        return svg;
    }

    /** Create a lattice link for the contained SVG element. */
    private _createLatticeLink(link: LatticeLink): SVGElement {
        const path = document.createElementNS(
            "http://www.w3.org/2000/svg", "line");
        path.setAttribute("id", `lattice-link-${link.base_a_id}-${link.base_b_id}`);

        // Game and database use inverted Y coordinates
        path.setAttribute("x1", (link.map_pos_a_x + this.mapSize * 0.5).toFixed());
        path.setAttribute("y1", (-link.map_pos_a_y + this.mapSize * 0.5).toFixed());
        path.setAttribute("x2", (link.map_pos_b_x + this.mapSize * 0.5).toFixed());
        path.setAttribute("y2", (-link.map_pos_b_y + this.mapSize * 0.5).toFixed());
        return path;
    }
}
