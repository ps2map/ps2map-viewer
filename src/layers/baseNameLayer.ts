/**
 * Basic map layer used for text and images.
 *
 * This is used for base names and other basic elements that require
 * minimal customisation for zoom levels.
 */

/// <reference path="./base.ts" />

/**
 * MapLayer subclass used to draw base names and icons on the map.
 */
class BaseNameLayer extends MapLayer {
    private domObjectMap: Map<number, HTMLElement>;

    constructor(layer: HTMLDivElement, initialContinentId: number) {
        super(layer, initialContinentId);
        this.domObjectMap = new Map();
    }

    /**
     * Zoom level callback. When called, all bases in the layer will be
     * resized according to the given zoom leve.
     * @param zoomLevel
     */
    public onZoom(zoomLevel: number): void {
        for (let i = 0; i < this.layer.children.length; i++) {
            const base = <HTMLDivElement>this.layer.children.item(i);
            base.style.transform = `scale(${1 / zoomLevel})`;
        }
    }

    /**
     * Switch the currently active continent.
     * @param continentId ID of the new continent to display.
     */
    public switchContinent(continentId: number): void {
        getBasesFromContinent(continentId).then((bases) => {
            const elements: Array<HTMLDivElement> = [];
            bases.forEach((base) => {
                // Create anchor
                const anchor = document.createElement("div");
                anchor.setAttribute("class", "layer-names__anchor");
                anchor.setAttribute("data-base-id", base.id.toString());
                this.domObjectMap.set(base.id, anchor);
                elements.push(anchor);
                // Position anchor on map
                const posX = (4096 + base.map_pos[0]) / 81.92;
                const posY = (4096 + base.map_pos[1]) / 81.92;
                anchor.style.left = `${posX}%`;
                anchor.style.bottom = `${posY}%`;
                // Create base icon
                const iconBox = document.createElement("div");
                anchor.appendChild(iconBox);
                iconBox.setAttribute("class", "layer-names__icon");
                const layerImage = document.createElement("div");
                iconBox.appendChild(layerImage);
                const icon = document.createElement("img");
                layerImage.appendChild(icon);
                icon.setAttribute("alt", base.type_name);
                icon.setAttribute(
                    "src",
                    this.getBaseIconFromType(base.type_id)
                );
                // Create base name
                const label = document.createElement("p");
                anchor.appendChild(label);
                label.classList.add("layer-names__label");
                label.innerHTML = base.name;
                const labelShadow = document.createElement("p");
                anchor.appendChild(labelShadow);
                labelShadow.classList.add(
                    "layer-names__label",
                    "layer-names__label--shadow"
                );
                labelShadow.innerHTML = base.name;
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
        const idList = baseId instanceof Array ? baseId : [baseId];
        idList.forEach((id) => {
            const anchor = this.domObjectMap.get(id);
            if (anchor == null) {
                console.warn(`Ignoring unknown base ID ${id}`);
                return;
            }
            this.setBaseIconColour(anchor, newColour);
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
    private setBaseIconColour(base: HTMLElement, newColour: string): void {
        const elem = base.firstElementChild;
        if (!(elem instanceof HTMLElement)) {
            return;
        }
        elem.style.setProperty("--baseIconColour", newColour);
    }
}
