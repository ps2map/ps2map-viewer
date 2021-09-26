/// <reference path="../map-engine/point-layer.ts" />

/** Base name and icon layer subclass. */
class BaseNamesLayer extends PointLayer {
    /**
     * Return the relative path to the SVG icon for a given base type.
     * @param typeId ID of the base type
     * @returns Relative path to the target file
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
                console.warn(`Encountered unknown facility ID: ${typeId}`);
        }
        return fileName;
    }

    loadBaseInfo(bases: Api.BaseInfo[]): void {
        const features: PointFeature[] = [];
        let i = bases.length;
        while (i-- > 0) {
            const baseInfo = bases[i];
            const pos = {
                x: baseInfo.map_pos[0],
                y: baseInfo.map_pos[1]
            };
            const element = document.createElement("div");
            element.innerText = `${baseInfo.name}`;
            element.classList.add("ps2map__base-names__icon")
            element.style.left = `${this.mapSize * 0.5 + pos.x}px`;
            element.style.bottom = `${this.mapSize * 0.5 + pos.y}px`;

            const typeName = this.getBaseIconFromType(baseInfo.type_id);
            element.classList.add(`ps2map__base-names__icon__${typeName}`)

            features.push(new PointFeature(pos, baseInfo.id, element));
            this.element.appendChild(element);
        }
        this.features = features;
    }
}