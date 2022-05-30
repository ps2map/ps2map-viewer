
class Tool {
    readonly map: MapRenderer;
    readonly viewport: HTMLDivElement

    constructor(viewport: HTMLDivElement, renderer: MapRenderer) {
        this.map = renderer;
        this.viewport = viewport;
    }

    activate(): void {
        dispatchEvent(new CustomEvent("tool-activated", {
            detail: {
                tool: this,
            }
        }));
    }

    deactivate(): void {
        dispatchEvent(new CustomEvent("tool-deactivated", {
            detail: {
                tool: this,
            }
        }));
    }

    getDisplayName(): string {
        return "Cursor";
    }

    protected getMapPosition(event: MouseEvent): [number, number] {
        const clickRelX = (event.clientX - this.viewport.offsetLeft) / this.viewport.clientWidth;
        const clickRelY = 1 - (event.clientY - this.viewport.offsetTop) / this.viewport.clientHeight;
        const viewBox = this.map.getCamera().getViewBox();
        const xMap = -this.map.getMapSize() * 0.5 + viewBox.left + (viewBox.right - viewBox.left) * clickRelX;
        const yMap = -this.map.getMapSize() * 0.5 + viewBox.bottom + (viewBox.top - viewBox.bottom) * clickRelY;
        return [xMap, yMap];
    }
}