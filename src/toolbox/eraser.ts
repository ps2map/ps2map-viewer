/// <reference path="./tool.ts" />

class Eraser extends Tool {

    static readonly id = "eraser";
    static readonly displayName = "Eraser";

    private _stroke: Readonly<Point>[] = [];

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
        frag.appendChild(document.createTextNode("Hold LMB to delete strokes, MMB to pan"));
        this._tool_panel.appendChild(frag);
        this._tool_panel.style.display = "block";
    }

    private _onMouseDown(event: MouseEvent): void {
        if (event.button !== 0)
            return;
        let last = this._map.renderer.screenToMap(event);
        this._stroke = [last];

        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            const next = this._map.renderer.screenToMap(evtDrag);
            // Get distance
            const dist = Math.hypot(next.x - last.x, next.y - last.y);
            if (dist < 4.0)  // TODO: Configurable?
                return;
            this._stroke.push(next);
            last = next;
        });

        const up = () => {
            this._viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
            StateManager.dispatch(State.user.canvasStrokeErase, this._stroke);
            this._stroke = [];
        };

        this._viewport.addEventListener(
            "mousemove", drag, { passive: true });
        document.addEventListener(
            "mouseup", up, { passive: true });
    }
}
