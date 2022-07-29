/// <reference path="./tool.ts" />

class BaseInfo extends Tool {

    static readonly id = "base-info";
    static readonly displayName = "Base Info";

    constructor(
        viewport: HTMLDivElement,
        map: HeroMap,
        tool_panel: HTMLDivElement
    ) {
        super(viewport, map, tool_panel);
        this._onHover = this._onHover.bind(this);
        StateManager.subscribe(State.user.baseHovered, this._onHover);
    }

    public tearDown(): void {
        super.tearDown();
        StateManager.unsubscribe(State.user.baseHovered, this._onHover);
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        this._tool_panel.innerHTML = `
        <span class="ps2map__tool__base-info__name" id="tool-base-name"></span>
        <img class="ps2map__tool__base-info__type-icon" id="tool-base-icon"/>
        <span class="ps2map__tool__base-info__type" id="tool-base-type"></span>
        `;
        this._tool_panel.innerHTML += `
        <br/>
        <img class="ps2map__tool__base-info__resource-icon" id="tool-base-resource-icon"/>
        <span class="ps2map__tool__base-info__resource-text" id="tool-base-resource-name"></span>
        `;
    }

    private _updateBaseInfo(base: Base | null): void {
        if (!base) {
            this._tool_panel.removeAttribute("style");
            return;
        }
        this._tool_panel.style.display = "block";

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
