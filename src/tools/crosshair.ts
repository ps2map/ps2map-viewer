/// <reference path="tool.ts" />

class Crosshair extends Tool {

    private callback: ((arg0: MouseEvent) => void) | undefined = undefined;

    activate(): void {
        super.activate();
        this.viewport.style.cursor = "crosshair";
        this.callback = this.onMove.bind(this);
        this.viewport.addEventListener("mousemove", this.callback, { passive: true });

        this.setupToolPanel();
    }

    deactivate(): void {
        super.deactivate();
        if (this.callback)
            this.viewport.removeEventListener("click", this.callback);
        this.viewport.style.removeProperty("cursor");
        const parent = this.tool_panel;
        if (parent)
            parent.removeAttribute("style");
    }

    static getDisplayName(): string {
        return "Crosshair";
    }

    static getId(): string {
        return "crosshair";
    }

    private setupToolPanel(): void {
        const parent = this.tool_panel;
        if (!parent)
            return;

        parent.style.display = "grid";
        parent.style.gridTemplateColumns = "1fr 1fr";
        parent.style.gridTemplateRows = "1fr 1fr";

        const x_label = document.createElement("span");
        x_label.classList.add("ps2map__tool__crosshair__label");
        x_label.textContent = "X";
        parent.appendChild(x_label);

        const x_value = document.createElement("span");
        x_value.id = "tool-crosshair_x";
        x_value.classList.add("ps2map__tool__crosshair__value");
        parent.appendChild(x_value);

        const y_label = document.createElement("span");
        y_label.classList.add("ps2map__tool__crosshair__label");
        y_label.textContent = "Y";
        parent.appendChild(y_label);

        const y_value = document.createElement("span");
        y_value.id = "tool-crosshair_y";
        y_value.classList.add("ps2map__tool__crosshair__value");
        parent.appendChild(y_value);

        this.updateToolPanel(0, 0);
    }

    private updateToolPanel(x: number, y: number): void {
        const x_value = document.getElementById("tool-crosshair_x") as HTMLSpanElement;
        x_value.textContent = x.toFixed(2);

        const y_value = document.getElementById("tool-crosshair_y") as HTMLSpanElement;
        y_value.textContent = y.toFixed(2);
    }

    private onMove(event: MouseEvent): void {
        const [x, y] = this.getMapPosition(event);

        this.updateToolPanel(x, y);
    }
}