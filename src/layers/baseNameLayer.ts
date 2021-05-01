/**
 * Basic map layer used for text and images.
 *
 * This is used for base names and other basic elements that require
 * minimal customisation for zoom levels.
 */

/// <reference path="../utils.ts" />
/// <reference path="./base.ts" />

/**
 * MapLayer subclass used to draw base names and icons on the map.
 */
class BaseNameLayer extends MapLayer {
    // TODO: Hide small bases at small zoom levels

    /**
     * Switch the currently active continent.
     * @param continentId ID of the new continent to display.
     */
    public setContinent(continentId: number): void {
        // Hard-coded base names for now
        const bases = getBasesFromContinent(continentId);
        bases.then((bases) => {
            const elements: Array<HTMLDivElement> = [];
            bases.forEach((base) => {
                const anchor = document.createElement("div");
                const offsetX = (4096 + base.map_pos[0]) / 81.92;
                const offsetY = (4096 + base.map_pos[1]) / 81.92;
                anchor.setAttribute("class", "mapAnchor");
                anchor.style.left = `${offsetX}%`;
                anchor.style.bottom = `${offsetY}%`;
                // Base icon
                const iconBox = document.createElement("div");
                anchor.appendChild(iconBox);
                iconBox.setAttribute("class", "iconBox");
                const layerImage = document.createElement("div");
                iconBox.appendChild(layerImage);
                layerImage.setAttribute("class", "layeredIcon");
                const icon = document.createElement("img");
                layerImage.appendChild(icon);
                icon.setAttribute("alt", "Amp Station");
                icon.setAttribute("src", "img/icons/amp-station.svg");
                const name = document.createElement("p");
                anchor.appendChild(name);
                name.setAttribute("class", "baseLabel");
                name.innerHTML = base.name;
                elements.push(anchor);
            });
            this.clear();
            elements.forEach((element) => this.layer.appendChild(element));
        });
    }
}
