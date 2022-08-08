/// <reference path="./tool.ts" />

class Cursor extends Tool {

    static readonly id = "cursor";
    static readonly displayName = "Map Cursor";
    static readonly hotkey = "q";

    constructor(
        viewport: HTMLDivElement,
        map: HeroMap,
        toolPanel: HTMLDivElement,
    ) {
        super(viewport, map, toolPanel);
        this._onMove = this._onMove.bind(this);
    }

    public activate(): void {
        super.activate();
        this._viewport.addEventListener(
            "mousemove", this._onMove, { passive: true });
    }

    public deactivate(): void {
        super.deactivate();
        this._viewport.removeEventListener("mousemove", this._onMove);
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        // Dynamic elements
        const x = Object.assign(document.createElement("span"), {
            id: "tool-cursor_x",
        });
        const y = Object.assign(document.createElement("span"), {
            id: "tool-cursor_y",
        });
        // Static elements
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("X:"));
        frag.appendChild(x);
        frag.appendChild(document.createTextNode(" Y:"));
        frag.appendChild(y);
        this._toolPanel.appendChild(frag);
        // Set style
        Object.assign(this._toolPanel.style, {
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            minWidth: "120px",
            fontFamily: "Consolas, monospace",
            fontSize: "18px",
            justifyItems: "right",
        });
        this._updateToolPanel({ x: 0, y: 0 });
    }

    private _updateToolPanel(target: Readonly<Point>): void {
        const x = document.getElementById("tool-cursor_x");
        if (x)
            x.textContent = target.x.toFixed(2);
        const y = document.getElementById("tool-cursor_y");
        if (y)
            y.textContent = target.y.toFixed(2);
    }

    private _onMove(event: MouseEvent): void {
        this._updateToolPanel(this._map.screenToMap(event));
    }
}
