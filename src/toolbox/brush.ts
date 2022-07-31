/// <reference path="./tool.ts" />

class Brush extends CanvasTool {

    static size = 10;
    static color = "rgb(255, 255, 0)";

    static readonly id = "brush";
    static readonly displayName = "Brush";

    protected _setUpCursor(): void {
        this._cursor.style.width = this._cursor.style.height = Brush.size + "px";
        this._cursor.style.marginLeft = this._cursor.style.marginTop = (-Brush.size / 2) + "px";
        this._cursor.style.border = "1px solid #fff";
        this._cursor.style.borderRadius = Brush.size * 0.5 + "px";
    }

    protected _action(
        context: CanvasRenderingContext2D,
        pos: Point,
        scale: number,
    ): void {
        context.fillStyle = Brush.color;
        context.beginPath();
        context.arc(pos.x, pos.y, Brush.size * scale * 0.5, 0, 2 * Math.PI, false);
        context.fill();
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        const frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("Hold LMB to draw, MMB to pan"));
        frag.appendChild(document.createElement("br"));
        frag.appendChild(document.createTextNode("Color:"));
        const picker = document.createElement("input");
        picker.type = "color";
        picker.value = "#ffff00";
        picker.style.margin = "10px";
        picker.addEventListener("change", () => {
            Brush.color = picker.value;
        });
        frag.appendChild(picker)
        this._tool_panel.appendChild(frag);
        this._tool_panel.style.display = "block";
    }
}
