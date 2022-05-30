
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
}