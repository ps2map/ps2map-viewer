/// <reference path="./tool.ts" />

class BaseInfo extends Tool {

    static readonly id = "base-info";
    static readonly displayName = "Base Info";
    static readonly hotkey = "q";

    constructor(
        viewport: HTMLDivElement,
        map: HeroMap,
        toolPanel: HTMLDivElement,
    ) {
        super(viewport, map, toolPanel);
        this._onHover = this._onHover.bind(this);
    }

    public activate(): void {
        super.activate();
        StateManager.subscribe(State.user.baseHovered, this._onHover);
    }

    public deactivate(): void {
        super.deactivate();
        StateManager.unsubscribe(State.user.baseHovered, this._onHover);
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        const frag = document.createDocumentFragment();
        frag.appendChild(Object.assign(document.createElement("span"), {
            id: "tool-base-name",
            classList: "ps2map__tool__base-info__name",
        }));
        frag.appendChild(Object.assign(document.createElement("img"), {
            id: "tool-base-icon",
            classList: "ps2map__tool__base-info__type-icon",
        }));
        frag.appendChild(Object.assign(document.createElement("span"), {
            id: "tool-base-type",
            classList: "ps2map__tool__base-info__type",
        }));
        frag.appendChild(document.createElement("br"));
        frag.appendChild(Object.assign(document.createElement("img"), {
            id: "tool-base-resource-icon",
            classList: "ps2map__tool__base-info__resource-icon",
        }));
        frag.appendChild(Object.assign(document.createElement("span"), {
            id: "tool-base-resource-name",
            classList: "ps2map__tool__base-info__resource-text",
        }));
        this._toolPanel.appendChild(frag);
    }

    private _updateBaseInfo(base: Base | null): void {
        if (!base) {
            this._toolPanel.removeAttribute("style");
            return;
        }
        this._toolPanel.style.display = "block";

        const name = document.getElementById("tool-base-name") as HTMLSpanElement;
        const typeIcon = document.getElementById("tool-base-icon") as HTMLImageElement;
        const type = document.getElementById("tool-base-type") as HTMLSpanElement;
        const resourceIcon = document.getElementById("tool-base-resource-icon") as HTMLImageElement;
        const resourceText = document.getElementById("tool-base-resource-name") as HTMLSpanElement;

        name.textContent = base.name;
        type.textContent = base.type_name;
        typeIcon.src = `img/icons/${base.type_code}.svg`;
        if (base.resource_code) {
            resourceIcon.src = `img/icons/${base.resource_code}.png`;
            resourceText.textContent = `${base.resource_capture_amount} ${base.resource_name} (${base.resource_control_amount.toFixed(1)}/min)`;
        }
    }

    private _onHover(state: State.AppState): void {
        this._updateBaseInfo(state.user.hoveredBase);
    }
}
