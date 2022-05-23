/// <reference path="../map-engine/static-layer.ts" />

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
class BaseNamesLayer extends StaticLayer {
    features: BaseNameFeature[] = []

    loadBaseInfo(bases: Api.Base[]): void {
        const features: BaseNameFeature[] = [];
        let i = bases.length;
        while (i-- > 0) {
            const baseInfo = bases[i];
            if (baseInfo.type_code == "no-mans-land")
                continue; // "No man's land" bases do not get icons
            const pos = {
                x: baseInfo.map_pos[0],
                y: baseInfo.map_pos[1]
            };
            const element = document.createElement("div");
            let name = baseInfo.name;
            // Append the facility type for primary bases
            if (baseInfo.type_code == "amp-station" ||
                baseInfo.type_code == "bio-lab" ||
                baseInfo.type_code == "interlink" ||
                baseInfo.type_code == "tech-plant" ||
                baseInfo.type_code == "trident")

                name += ` ${baseInfo.type_name}`;
            element.innerText = `${name}`;
            element.classList.add("ps2map__base-names__icon")
            element.style.left = `${this.mapSize * 0.5 + pos.x}px`;
            element.style.bottom = `${this.mapSize * 0.5 + pos.y}px`;

            element.classList.add(`ps2map__base-names__icon__${baseInfo.type_code}`)

            let minZoom = 0;
            if (baseInfo.type_code == "small-outpost") minZoom = 0.60
            if (baseInfo.type_code == "large-outpost") minZoom = 0.45;

            features.push(new BaseNameFeature(pos, baseInfo.id, baseInfo.name, element, minZoom));
            this.element.appendChild(element);
        }
        this.features = features;
    }

    /**
     * Callback invoked when hovering over base hexes.
     * 
     * This displays the name of the current base regardless of zoom level.
     * @param baseId ID of the base that was highlighted
     * @param element SVG polygon of the highlighted base.
     */
    onBaseHover(baseId: number, element: SVGPolygonElement): void {
        let feat: BaseNameFeature | null = null;
        let i = this.features.length;
        while (i-- > 0)
            if (this.features[i].id == baseId)
                feat = this.features[i];
        if (feat == null)
            return;
        const leave = () => {
            if (feat == null) throw "feature was unset";
            element.removeEventListener("mouseleave", leave);
            feat.forceVisible = false;
            if (feat.visible)
                feat.element.innerText = feat.text;
            else
                feat.element.innerText = "";
        }
        element.addEventListener("mouseleave", leave);
        feat.forceVisible = true;
        feat.element.innerText = feat.text;
    }

    protected deferredLayerUpdate(viewBox: Box, zoom: number) {
        const unzoom = 1 / zoom;
        let i = this.features.length;
        while (i-- > 0) {
            const feat = this.features[i];
            feat.element.style.transform = (
                `translate(-50%, calc(var(--ps2map__base-icon-size) * ${unzoom})) ` +
                `scale(${unzoom}, ${unzoom})`);
            if (!feat.forceVisible)
                if (zoom >= feat.minZoom)
                    feat.element.innerText = feat.text;
                else
                    feat.element.innerText = "";
            feat.visible = zoom >= feat.minZoom;
        }
    }
}