/// <reference path="../api/index.ts" />
/// <reference path="../map-engine/static-layer.ts" />

/**
 * A static layer rendering lattice links for a given continent.
 */
class LatticeLayer extends StaticLayer {

    private latticeLinkCache: Api.LatticeLink[] = [];

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__lattice");
    }

    updateBaseOwnership(baseId: number, baseOwnershipMap: Map<number, number>): void {
        const colours: any = {
            0: "rgba(0, 0, 0, 1.0)",
            1: "rgba(120, 37, 143, 1.0)",
            2: "rgba(41, 83, 164, 1.0)",
            3: "rgba(186, 25, 25, 1.0)",
            4: "rgba(50, 50, 50, 1.0)",
        }

        let i = this.latticeLinkCache.length;
        while (i-- > 0) {
            const link = this.latticeLinkCache[i];
            if (link.base_a_id == baseId || link.base_b_id == baseId) {
                const id = `#lattice-link-${link.base_a_id}-${link.base_b_id}`;
                const element = this.element.querySelector(id) as SVGLineElement | null;
                if (!element)
                    continue;
                const ownerA = baseOwnershipMap.get(link.base_a_id);
                const ownerB = baseOwnershipMap.get(link.base_b_id);
                if (ownerA == undefined || ownerB == undefined)
                    continue;
                if (ownerA == ownerB)
                    element.style.stroke = colours[ownerA];
                else
                    element.style.stroke = "orange";
            }
        }
    }

    setContinent(continent: Api.Continent): void {
        console.log("LatticeLayer.setContinent", continent);
        Api.getLatticeForContinent(continent)
            .then((links) => {
                this.latticeLinkCache = [];
                let i = links.length;
                while (i-- > 0)
                    this.latticeLinkCache.push(links[i])
                this.createLatticeSvg();
            });
    }

    private createLatticeSvg(): void {
        this.element.innerHTML = "";
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${this.mapSize} ${this.mapSize}`);

        this.latticeLinkCache.forEach((link) => {
            svg.appendChild(this.createLatticeLink(link));
        });
        this.element.appendChild(svg);
    }

    private createLatticeLink(link: Api.LatticeLink): SVGElement {
        const path = document.createElementNS(
            "http://www.w3.org/2000/svg", "line");
        path.setAttribute("id", `lattice-link-${link.base_a_id}-${link.base_b_id}`);

        // TODO: Lattice links are still stored with the game's inverted y-axis
        // in the database, hence the inversion here - to be rectified.
        path.setAttribute("x1", (link.map_pos_a_x + this.mapSize * 0.5).toFixed());
        path.setAttribute("y1", (-link.map_pos_a_y + this.mapSize * 0.5).toFixed());
        path.setAttribute("x2", (link.map_pos_b_x + this.mapSize * 0.5).toFixed());
        path.setAttribute("y2", (-link.map_pos_b_y + this.mapSize * 0.5).toFixed());
        return path;
    }
}
