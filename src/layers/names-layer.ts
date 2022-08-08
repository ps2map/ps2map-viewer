/// <reference path="../interfaces/index.ts" />
/// <reference path="../rest/index.ts" />
/// <reference path="../map-engine/map-layer.ts" />
/// <reference path="./base.ts" />

class BaseNameFeature {
    /** HTML element associated with the feature. */
    readonly element: HTMLElement;
    /** Unique identifier for the feature. */
    readonly id: number;
    /** Position of the feature on the map. */
    readonly pos: Point;
    /** Text displayed on the base icon. */
    readonly text: string;
    /** Minimum zoom level at which the element is visible. */
    readonly minZoom: number;
    /** Visibility DOM cache */
    visible: boolean = true;

    forceVisible: boolean = false;

    constructor(pos: Point, id: number, text: string, element: HTMLElement, minZoom: number = 0) {
        this.element = element;
        this.id = id;
        this.text = text;
        this.pos = pos;
        this.minZoom = minZoom;
    }
}



/** Base name and icon layer subclass. */
class BaseNamesLayer extends StaticLayer implements SupportsBaseOwnership {
    features: BaseNameFeature[] = [];

    private constructor(id: string, size: Box) {
        super(id, size);
    }

    static async factory(continent: Continent, id: string,
    ): Promise<BaseNamesLayer> {
        const size = { width: continent.map_size, height: continent.map_size };
        const layer = new BaseNamesLayer(id, size);
        return fetchBasesForContinent(continent.id)
            .then((bases: Base[]) => {
                layer._loadBaseInfo(bases);
                layer.updateLayer();
                return layer;
            });
    }

    updateBaseOwnership(map: Map<number, number>): void {
        map.forEach((owner, baseId) => {
            const feat = this.features.find(f => f.id === baseId);
            if (feat)
                feat.element.style.setProperty("--ps2map__base-color",
                    `var(${this._factionIdToCssVar(owner)}`);
        });
    }

    /**
     * Return the CSS variable name for the given faction.
     *
    * @param factionId - The faction ID to get the colour for.
    * @returns The CSS variable name for the faction's colour.
     */
    private _factionIdToCssVar(factionId: number): string {
        const code = GameData.getInstance().getFaction(factionId).code;
        return `--ps2map__faction-${code}-colour`;
    }

    private _loadBaseInfo(bases: Base[]): void {
        const features: BaseNameFeature[] = [];
        bases.forEach(baseInfo => {
            if (baseInfo.type_code === "no-mans-land")
                // "No man's land" bases do not get icons
                return;
            const pos = {
                x: baseInfo.map_pos[0],
                y: baseInfo.map_pos[1],
            };
            const element = document.createElement("div");
            let name = baseInfo.name;
            // Append the facility type for primary bases
            ["amp-station", "bio-lab", "interlink", "tech-plant", "trident"]
                .forEach(type => {
                    if (baseInfo.type_code === type)
                        name += ` ${baseInfo.type_name}`;
                });

            element.innerText = `${name}`;
            element.classList.add("ps2map__base-names__icon");
            element.style.left = `${this.size.width * 0.5 + pos.x}px`;
            element.style.bottom = `${this.size.height * 0.5 + pos.y}px`;

            element.classList.add(
                `ps2map__base-names__icon__${baseInfo.type_code}`);

            let minZoom = 0;
            if (baseInfo.type_code === "small-outpost") minZoom = 0.60;
            if (baseInfo.type_code === "large-outpost") minZoom = 0.45;

            features.push(new BaseNameFeature(
                pos, baseInfo.id, baseInfo.name, element, minZoom));
            this.element.appendChild(element);
        });
        this.features = features;
    }

    /**
     * Callback invoked when hovering over base hexes.
     *
     * This displays the name of the current base regardless of zoom level.
     */
    setHoveredBase(base: Base | null): void {
        this.features.forEach(feat => {
            if (feat.id === base?.id) {
                feat.forceVisible = true;
                feat.element.innerText = feat.text;
            } else {
                feat.forceVisible = false;
                if (!feat.visible)
                    feat.element.innerText = "";
            }
        });
    }

    protected deferredLayerUpdate(_: ViewBox, zoom: number) {
        const unzoom = 1 / zoom;
        this.features.forEach(feat => {
            feat.element.style.transform = (
                `translate(-50%, calc(var(--ps2map__base-icon-size) ` +
                `* ${unzoom})) scale(${unzoom}, ${unzoom})`);
            if (!feat.forceVisible)
                if (zoom >= feat.minZoom)
                    feat.element.innerText = feat.text;
                else
                    feat.element.innerText = "";
            feat.visible = zoom >= feat.minZoom;
        });
    }
}
