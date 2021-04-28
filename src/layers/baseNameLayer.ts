/**
 * Basic map layer used for text and images.
 *
 * This is used for base names and other basic elements that require
 * minimal customisation for zoom levels.
 */

/// <reference path="../utils.ts" />
/// <reference path="./base.ts" />

class BaseNameLayer extends MapLayer {
    // TODO: Hide small bases at small zoom levels

    public setContinent(continentId: number): void {
        // Hard-coded base names for now
        const bases = getBasesFromContinent(continentId);
        bases.then((bases) => {
            const elements: Array<HTMLDivElement> = [];
            bases.forEach((base) => {
                const container = document.createElement("div");
                const offsetX = (4096 + base.map_pos[0]) / 81.92;
                const offsetY = (4096 + base.map_pos[1]) / 81.92;
                container.style.left = `${offsetX}%`;
                container.style.bottom = `${offsetY}%`;
                let icon = document.createElement("object");
                icon.setAttribute("data", "img/icons/warp-gate.svg");
                icon.setAttribute("type", "image/svg+xml");
                container.appendChild(icon);
                let name = document.createElement("span");
                name.innerHTML = base.name;
                container.appendChild(name);
                elements.push(container);
            });
            this.clear();
            elements.forEach((element) => this.layer.appendChild(element));
        });
    }
}
