/// <reference path="tool.ts" />

class Cursor extends Tool {

    static readonly id = "cursor";
    static readonly displayName = "Map Cursor";

    constructor(
        viewport: HTMLDivElement,
        map: HeroMap,
        tool_panel: HTMLDivElement
    ) {
        super(viewport, map, tool_panel);
        this._onMove = this._onMove.bind(this);
        this._viewport.addEventListener(
            "mousemove", this._onMove, { passive: true });
    }

    public tearDown(): void {
        super.tearDown();
        this._viewport.removeEventListener("mousemove", this._onMove);
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        this._tool_panel.innerHTML += `
        <div class="tools__cursor">
            <span>X:</span>
            <span id="tool-cursor_x">0.00</span>
            <span>Y:</span>
            <span id="tool-cursor_y">0.00</span>            
        </div>
        `;
        this._tool_panel.style.display = "block";
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
        this._updateToolPanel(this._getMapPosition(event));
    }

}