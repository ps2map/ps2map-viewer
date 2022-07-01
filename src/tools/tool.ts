
class Tool {
    readonly map: HeroMap;
    readonly viewport: HTMLDivElement

    constructor(viewport: HTMLDivElement, map: HeroMap) {
        this.map = map;
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

    static getDisplayName(): string {
        return "None";
    }

    static getId(): string {
        return "default";
    }

    protected getMapPosition(event: MouseEvent): [number, number] {
        const clickRelX = (event.clientX - this.viewport.offsetLeft) / this.viewport.clientWidth;
        const clickRelY = 1 - (event.clientY - this.viewport.offsetTop) / this.viewport.clientHeight;
        const renderer = this.map.getRenderer();
        const viewBox = renderer.getCamera().getViewBox();
        const xMap = -renderer.getMapSize() * 0.5 + viewBox.left + (viewBox.right - viewBox.left) * clickRelX;
        const yMap = -renderer.getMapSize() * 0.5 + viewBox.bottom + (viewBox.top - viewBox.bottom) * clickRelY;
        return [xMap, yMap];
    }
}