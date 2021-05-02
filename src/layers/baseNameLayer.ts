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
     * Update the facility ownership for a given base.
     * @param baseId The base or bases to update ownership for.
     * @param factionId The faction that has ownership now.
     */
    public setBaseOwnership(
        baseId: number | Array<number>,
        factionId: number
    ): void {
        const newColour = this.getFactionColour(factionId);
        for (let i = 0; i < this.layer.children.length; i++) {
            const base = <HTMLDivElement>this.layer.children.item(i);
            const attrId = base.getAttribute("baseId");
            if (attrId == null) {
                continue;
            }
            if (
                (baseId instanceof Array && parseInt(attrId) in baseId) ||
                parseInt(attrId) == baseId
            ) {
                this.setBaseIconColour(base, newColour);
                // Break if only one base ID was specified
                if (baseId instanceof Number) {
                    break;
                }
            }
        }
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

    /**
     * Return the icon colour for a given faction.
     * @param factionId The faction to return the colour for.
     * @returns A string representing the CSS colour, i.e. either a
     * var() expression or a hex colour value.
     */
    private getFactionColour(factionId: number): string {
        switch (factionId) {
            case 1:
                return "var(--COLOR-FG-CAPPED-VS)";
            case 2:
                return "var(--COLOR-FG-CAPPED-NC)";
            case 3:
                return "var(--COLOR-FG-CAPPED-TR)";
            default:
                return "#333333";
        }
    }

    /**
     * Update the base icon to use the given colour.
     * @param base The base anchor to apply the new colour to.
     * @param newColour The new colour to apply as a string.
     */
    private setBaseIconColour(base: HTMLDivElement, newColour: string): void {
        const icon = <HTMLDivElement>base.children[0];
        icon.style.setProperty("--baseIconColour", newColour);
    }
}
