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
        getBasesFromContinent(continentId).then((bases) => {
            const elements: Array<HTMLDivElement> = [];
            bases.forEach((base) => {
                const anchor = document.createElement("div");
                const posX = (4096 + base.map_pos[0]) / 81.92;
                const posY = (4096 + base.map_pos[1]) / 81.92;
                anchor.setAttribute("class", "mapAnchor");
                anchor.setAttribute("baseId", base.id.toString());
                anchor.style.left = `${posX}%`;
                anchor.style.bottom = `${posY}%`;
                const iconBox = document.createElement("div");
                anchor.appendChild(iconBox);
                iconBox.setAttribute("class", "iconBox");
                const layerImage = document.createElement("div");
                iconBox.appendChild(layerImage);
                layerImage.setAttribute("class", "layeredIcon");
                const icon = document.createElement("img");
                layerImage.appendChild(icon);
                icon.setAttribute("alt", "Amp Station");
                icon.setAttribute(
                    "src",
                    this.getBaseIconFromType(base.type_id)
                );
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

    /**
     * Return the relative path to the SVG icon for a given base type.
     * @param typeId The base type for which to return the icon.
     * @returns Relative path to the target file.
     */
    private getBaseIconFromType(typeId: number): string {
        let fileName = "containment-site";
        switch (typeId) {
            case 2:
                fileName = "amp-station";
                break;
            case 3:
                fileName = "bio-lab";
                break;
            case 4:
                fileName = "tech-plant";
                break;
            case 5:
                fileName = "large-outpost";
                break;
            case 6:
                fileName = "small-outpost";
                break;
            case 7:
                fileName = "warpgate";
                break;
            case 9:
                fileName = "construction-outpost";
                break;
            default:
                console.warn(`Encountered unknown facility type ID: ${typeId}`);
                break;
        }
        return `img/icons/${fileName}.svg`;
    }
}
