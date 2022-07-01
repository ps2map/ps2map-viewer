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
        const parent = this.tool_panel;
        if (parent)
            parent.style.display = "block";
    }

    deactivate(): void {
        super.deactivate();
        if (this.callback) {
            const hex_layer = this.map.getRenderer().getLayer("hexes") as MapLayer;
            hex_layer.element.removeEventListener("ps2map_basehover", this.callback);
        }
        const parent = this.tool_panel;
        if (parent)
            parent.removeAttribute("style");
    }

    static getDisplayName(): string {
        return "Base Info";
    }

    static getId(): string {
        return "base-info";
    }

    private onHover(event: Event): void {
        if (event.type !== "ps2map_basehover")
            return;
        const evt = event as CustomEvent<BaseHoverEvent>;

        const base = evt.detail.baseId;
        const base_info = this.bases.get(base);
        if (base_info == undefined)
            return;

        this.tool_panel.innerHTML = "";
        const name = document.createElement("span");
        name.classList.add("ps2map__tool__base-info__name");
        name.textContent = base_info.name;
        this.tool_panel.appendChild(name);

        const type_icon = document.createElement("img");
        type_icon.classList.add("ps2map__tool__base-info__type-icon");
        type_icon.src = `img/icons/${base_info.type_code}.svg`;
        this.tool_panel.appendChild(type_icon);

        const type = document.createElement("span");
        type.classList.add("ps2map__tool__base-info__type");
        type.textContent = base_info.type_name;
        this.tool_panel.appendChild(type);

        const resource_icon = document.createElement("img");
        resource_icon.classList.add("ps2map__tool__base-info__resource-icon");
        resource_icon.src = `img/icons/${base_info.resource_code}.svg`;
        resource_icon.alt = base_info.resource_name || "";
        this.tool_panel.appendChild(resource_icon);

    }
}