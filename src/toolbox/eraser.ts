/// <reference path="./tool.ts" />

class Eraser extends CanvasTool {

    static readonly id = "eraser";
    static readonly displayName = "Eraser";
    static readonly hotkey = "e";

    static size = 40;

    protected _setUpCursor(): void {
        this._cursor.style.width = this._cursor.style.height = (
            Eraser.size + "px");
        this._cursor.style.marginLeft = this._cursor.style.marginTop = (
            (-Eraser.size / 2) + "px");
        this._cursor.style.border = "1px solid #fff";
    }

    protected _action(
        context: CanvasRenderingContext2D,
        pos: Point,
        scale: number,
    ): void {
        const size = Eraser.size * scale;
        context.clearRect(pos.x - size * 0.5, pos.y - size * 0.5, size, size);
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        const frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("Hold LMB to erase, MMB to pan"));
        this._tool_panel.appendChild(frag);
        this._tool_panel.style.display = "block";
    }
}
