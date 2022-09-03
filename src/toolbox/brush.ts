/// <reference path="./tool.ts" />

class Brush extends CanvasTool {

    static size = 10;
    static color = "rgb(255, 255, 0)";

    static readonly id = "brush";
    static readonly displayName = "Brush";
    static readonly help = "Hold LMB and drag on the map to draw. LMB "
        + "panning is disabled while Brush tool is active, use MMB to drag "
        + "while drawing. Brush size is relative to your current zoom level.";
    static readonly hotkey = "b";

    private _last: Readonly<Point> | null = null;

    protected _setUpCursor(): void {
        if (!this._cursor)
            return;
        this._cursor.style.width = this._cursor.style.height =
            `${Brush.size}px`;
        this._cursor.style.marginLeft = this._cursor.style.marginTop =
            this._cursor.style.borderRadius = `${-Brush.size / 2}px`;
        this._cursor.style.border = "1px solid #fff";
        this._cursor.style.borderRadius = "50%";
    }

    protected _action(
        context: CanvasRenderingContext2D,
        pos: Point,
        scale: number,
    ): void {
        const lineWeight = Brush.size * scale;
        context.fillStyle = Brush.color;
        context.strokeStyle = Brush.color;
        context.beginPath();

        // First point in a stroke
        if (!this._last) {
            context.arc(pos.x, pos.y, lineWeight * 0.5, 0, 2 * Math.PI, false);
            this._last = pos;
        } else {
            // Subsequent points in a stroke
            context.lineWidth = lineWeight;
            context.lineCap = "round";
            if (this._mouseDown) {
                context.moveTo(this._last.x, this._last.y);
                context.lineTo(pos.x, pos.y);
                context.stroke();
                this._last = pos;
            } else {
                // Don't draw anything, just reset the "_last" marker
                this._last = null;
            }
        }
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        const frag = document.createDocumentFragment();
        frag.appendChild(
            document.createTextNode("Hold LMB to draw, MMB to pan"));
        frag.appendChild(document.createElement("br"));
        frag.appendChild(document.createTextNode("Color:"));
        const picker = document.createElement("input");
        picker.type = "color";
        picker.value = "#ffff00";
        picker.style.margin = "10px";
        picker.addEventListener("change", () => {
            Brush.color = picker.value;
        });
        frag.appendChild(picker);
        this._toolPanel.appendChild(frag);
        this._toolPanel.style.display = "block";
    }
}
