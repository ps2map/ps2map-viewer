/// <reference path="./tool.ts" />

class Pen extends Tool {

    static readonly id = "pen";
    static readonly displayName = "Pen";

    private _last: Readonly<Point> = { x: 0, y: 0 };

    constructor(
        viewport: HTMLDivElement,
        map: HeroMap,
        tool_panel: HTMLDivElement,
    ) {
        super(viewport, map, tool_panel);
        map.renderer.allowPan = false;
        this._onMouseDown = this._onMouseDown.bind(this);
        this._viewport.addEventListener(
            "mousedown", this._onMouseDown, { passive: true });
    }

    public tearDown(): void {
        this._map.renderer.allowPan = true;
        super.tearDown();
        this._viewport.removeEventListener("mousedown", this._onMouseDown);
    }

    protected _setUpToolPanel(): void {
        super._setUpToolPanel();

        const frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("Hold LMB to draw, MMB to pan"));
        this._tool_panel.appendChild(frag);
        this._tool_panel.style.display = "block";
    }

    private _onMouseDown(event: MouseEvent): void {
        if (event.button !== 0)
            return;
        console.log("Mouse down");

        const layer = this._map.renderer.getLayer("canvas") as CanvasLayer;
        layer.element.style.opacity = "0.75";
        const ctx = layer.getCanvas().getContext("2d")!;
        const mapSize = this._map.renderer.getMapSize();

        this._last = this._getMapPosition(event);;

        ctx.beginPath();
        ctx.moveTo(mapSize * 0.5 + this._last.x, mapSize * 0.5 - this._last.y);
        ctx.strokeStyle = "rgb(255, 255, 0)";
        ctx.lineCap = "round";
        ctx.lineWidth = 10;

        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            console.log("drag");

            const next = this._getMapPosition(evtDrag);
            // Get distance
            const dist = Math.hypot(next.x - this._last.x, next.y - this._last.y);
            if (dist <= 10) {
                console.log("ignoring small step:", dist);
                return;
            }
            ctx.moveTo(mapSize * 0.5 + this._last.x, mapSize * 0.5 - this._last.y);
            ctx.lineTo(mapSize * 0.5 + next.x, mapSize * 0.5 - next.y);
            ctx.stroke();
            this._last = next;
        });

        const up = () => {
            console.log("up");
            ctx.stroke();
            this._viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };

        this._viewport.addEventListener(
            "mousemove", drag, { passive: true });
        document.addEventListener(
            "mouseup", up, { passive: true });
    }
}
