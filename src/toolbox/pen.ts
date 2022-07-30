/// <reference path="./tool.ts" />

class Pen extends Tool {

    static readonly id = "pen";
    static readonly displayName = "Pen";

    private _current: Readonly<Point>[] = [];

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
        const layer = this._map.renderer.getLayer("canvas") as CanvasLayer;
        layer.element.style.opacity = "0.75";
        const ctx = layer.getCanvas().getContext("2d")!;
        const mapSize = this._map.renderer.getMapSize();

        const start = this._getMapPosition(event);;
        this._current = [start];

        ctx.beginPath();
        ctx.moveTo(mapSize * 0.5 + start.x, mapSize * 0.5 - start.y);
        ctx.strokeStyle = "rgb(255, 255, 0)";
        ctx.lineCap = "round";
        ctx.lineWidth = 10;

        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            const last = this._current[this._current.length - 1];
            if (!last)
                return;
            const next = this._getMapPosition(evtDrag);
            // Get distance
            const dist = Math.hypot(next.x - last.x, next.y - last.y);
            if (dist <= 4.0)
                return;
            ctx.moveTo(mapSize * 0.5 + last.x, mapSize * 0.5 - last.y);
            ctx.lineTo(mapSize * 0.5 + next.x, mapSize * 0.5 - next.y);
            ctx.stroke();
            this._current.push(next);
        });

        const up = () => {
            ctx.stroke();
            this._viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
            StateManager.dispatch(State.user.canvasLineAdded, this._current);
            this._current = [];
        };

        this._viewport.addEventListener(
            "mousemove", drag, { passive: true });
        document.addEventListener(
            "mouseup", up, { passive: true });
    }
}
