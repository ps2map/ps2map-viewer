/// <reference path="tool.ts" />

class Crosshair extends Tool {

    private callback: ((arg0: MouseEvent) => void) | undefined = undefined;

    activate(): void {
        super.activate();
        this.viewport.style.cursor = "crosshair";
        this.callback = this.onClick.bind(this);
        this.viewport.addEventListener("click", this.callback, { passive: true });
    }

    deactivate(): void {
        super.deactivate();
        if (this.callback)
            this.viewport.removeEventListener("click", this.callback);
        this.viewport.style.removeProperty("cursor");
    }

    getDisplayName(): string {
        return "Crosshair";
    }

    private onClick(event: MouseEvent): void {
        // Only react on LMB
        if (event.button !== 0)
            return;
        const [x, y] = this.getMapPosition(event);
        console.log(`Clicked ${[x.toFixed(2), y.toFixed(2)]}`);
    }
}