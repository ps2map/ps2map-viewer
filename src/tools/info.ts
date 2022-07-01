/// <reference path="tool.ts" />

class BaseInfo extends Tool {

    private callback: ((arg0: Event) => void) | undefined = undefined;
    private bases: Map<number, Api.Base> = new Map();

    activate(): void {
        super.activate();
        this.callback = this.onHover.bind(this);
        const hex_layer = this.map.getRenderer().getLayer("hexes") as MapLayer;
        hex_layer.element.addEventListener("ps2map_basehover", this.callback);

        this.bases = new Map();
        const continent = this.map.getContinent();
        if (continent == undefined)
            return;
        Api.getBasesFromContinent(continent.id).then(
            (bases) => {
                this.bases = new Map(bases.map((base) => [base.id, base]));
            }
        );
    }

    deactivate(): void {
        super.deactivate();
        if (this.callback) {
            const hex_layer = this.map.getRenderer().getLayer("hexes") as MapLayer;
            hex_layer.element.removeEventListener("ps2map_basehover", this.callback);
        }
    }

    static getDisplayName(): string {
        return "Info";
    }

    static getId(): string {
        return "info";
    }

    private onHover(event: Event): void {
        if (event.type !== "ps2map_basehover")
            return;
        const evt = event as CustomEvent<BaseHoverEvent>;

        const base = evt.detail.baseId;
        const base_info = this.bases.get(base);
        if (base_info == undefined)
            return;

        console.log(`Hovering over ${base_info.name}`);
    }
}