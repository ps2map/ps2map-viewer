/// <reference path="../interfaces/index.ts" />
/// <reference path="../rest/index.ts" />
/// <reference path="./tool.ts" />

class BaseInfo extends Tool {

    private _callback: ((arg0: State.AppState) => void) | undefined = undefined;
    private _bases: Map<number, Base> = new Map();

    activate(): void {
        super.activate();
        this._callback = this._onHover.bind(this);
        StateManager.subscribe("user/baseHovered", this._callback);

        this._bases = new Map();
        const continent = this.map.continent();
        if (continent == undefined)
            return;
        fetchBasesForContinent(continent.id).then(
            (bases) => {
                this._bases = new Map(bases.map((base) => [base.id, base]));
            }
        );
        const parent = this.tool_panel;
        if (parent)
            parent.style.display = "block";
    }

    deactivate(): void {
        super.deactivate();
        if (this._callback)
            StateManager.unsubscribe("user/baseHovered", this._callback);
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

    private _onHover(event: State.AppState): void {
        const base = event.user.hoveredBase;
        if (base == undefined)
            return;

        this.tool_panel.innerHTML = "";
        const name = document.createElement("span");
        name.classList.add("ps2map__tool__base-info__name");
        name.textContent = base.name;
        this.tool_panel.appendChild(name);

        const type_icon = document.createElement("img");
        type_icon.classList.add("ps2map__tool__base-info__type-icon");
        type_icon.src = `img/icons/${base.type_code}.svg`;
        this.tool_panel.appendChild(type_icon);

        const type = document.createElement("span");
        type.classList.add("ps2map__tool__base-info__type");
        type.textContent = base.type_name;
        this.tool_panel.appendChild(type);

        if (base.resource_code != undefined) {
            this.tool_panel.appendChild(document.createElement("br"));

            const resource_icon = document.createElement("img");
            resource_icon.classList.add("ps2map__tool__base-info__resource-icon");
            resource_icon.src = `img/icons/${base.resource_code}.png`;
            this.tool_panel.appendChild(resource_icon);

            const resource_text = document.createElement("span");
            resource_text.classList.add("ps2map__tool__base-info__resource-text");
            resource_text.textContent = `${base.resource_capture_amount} ${base.resource_name} (${base.resource_control_amount.toFixed(1)}/min)`;
            this.tool_panel.appendChild(resource_text);
        }
    }
}