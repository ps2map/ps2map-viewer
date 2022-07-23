/// <reference path="../api/index.ts" />
/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

/**
 * A static layer rendering lattice links for a given continent.
 */
class LatticeLayer extends StaticLayer implements SupportsBaseOwnership {

    private _links: Api.LatticeLink[] = [];

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__lattice");
    }

    static async factory(continent: Api.Continent, id: string): Promise<LatticeLayer> {
        const layer = new LatticeLayer(id, continent.map_size);
        return Api.getLatticeForContinent(continent)
            .then((links) => {
                layer._links = [];
                let i = links.length;
                while (i-- > 0)
                    layer._links.push(links[i])
                layer._createLatticeSvg();
                return layer;
            });
    }

    updateBaseOwnership(baseOwnershipMap: Map<number, number>): void {

        const colours: any = {
            0: "rgba(0, 0, 0, 1.0)",
            1: "rgba(120, 37, 143, 1.0)",
            2: "rgba(41, 83, 164, 1.0)",
            3: "rgba(186, 25, 25, 1.0)",
            4: "rgba(50, 50, 50, 1.0)",
        };

        baseOwnershipMap.forEach((owner, baseId) => {
            const links = this._links.filter(
                l => l.base_a_id === baseId || l.base_b_id === baseId);
            links.forEach((link) => {
                // Get ownership for both bases
                const ownerA = baseOwnershipMap.get(link.base_a_id);
                const ownerB = baseOwnershipMap.get(link.base_b_id);
                if (ownerA == undefined || ownerB == undefined)
                    return;

                // Retrieve the SVG element of the link
                const id = `#lattice-link-${link.base_a_id}-${link.base_b_id}`;
                const element = this.element.querySelector(id) as SVGLineElement | null;
                if (element == null)
                    return;

                // Set the stroke colour
                if (ownerA == ownerB)
                    element.style.stroke = colours[ownerA];
                else if (ownerA == 0 || ownerB == 0)
                    element.style.stroke = colours[0];
                else
                    element.style.stroke = "orange";
            });
        });
    }

    private _createLatticeSvg(): void {
        this.element.innerHTML = "";
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${this.mapSize} ${this.mapSize}`);

        this._links.forEach((link) => {
            svg.appendChild(this._createLatticeLink(link));
        });
        this.element.appendChild(svg);
    }

    private _createLatticeLink(link: Api.LatticeLink): SVGElement {
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
