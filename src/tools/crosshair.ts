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
        // Get viewport-relative click position
        const xRel = (event.clientX - this.viewport.offsetLeft) / this.viewport.clientWidth;
        const yRel = 1 - (event.clientY - this.viewport.offsetTop) / this.viewport.clientHeight;
        // Convert to map-relative click position
        const viewBox = this.map.getCamera().getViewBox();
        const viewWidth = viewBox.right - viewBox.left;
        const viewHeight = viewBox.top - viewBox.bottom;
        const xMap = -this.map.getMapSize() * 0.5 + viewBox.left + viewWidth * xRel;
        const yMap = -this.map.getMapSize() * 0.5 + viewBox.bottom + viewHeight * yRel;

        console.log(`Clicked ${[xMap.toFixed(2), yMap.toFixed(2)]}`);

    }
}