/// <reference path="../tool.ts" />

namespace DevTools {

    export interface BaseInput {
        id: number;
        name: string;
        map_pos: [number, number];
        type_id: number;
    }

    export class BaseMarkers extends Tool {

        private placedBases: BaseInput[] = [];

        // Reference to bound version of onClick
        private callback: ((arg0: MouseEvent) => void) | undefined = undefined;

        constructor(viewport: HTMLDivElement, map: MapRenderer) {
            super(viewport, map);
            const btn = document.getElementById("export-bases") as HTMLInputElement;
            if (btn)
                btn.addEventListener("click", () => this.export());
        }

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

        clear(): void {
            this.placedBases = [];
        }

        export(): void {
            const data = JSON.stringify(this.placedBases);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "bases.json";
            a.click();
        }

        private onClick(event: MouseEvent): void {
            // Only react on LMB
            if (event.button !== 0)
                return;
            const pos = this.getMapPosition(event);

            const baseIdStr = prompt("Base ID (aka. map_region_id)");
            if (baseIdStr == null)
                return;
            const baseId = parseInt(baseIdStr);
            if (isNaN(baseId))
                return;
            const baseName = prompt("Base name");
            if (baseName == null)
                return;
            const typeIdStr = prompt(
                "Base type ID\n\n" +
                "1: No Man's Land\n" +
                "2: Amp Station\n" +
                "3: Bio Lab\n" +
                "4: Tech Plant\n" +
                "5: Large Outpost\n" +
                "6: Small Outpost\n" +
                "7: Warpgate\n" +
                "8: Interlink\n" +
                "9: Construction Outpost\n" +
                "11: Containment Site\n" +
                "12: Trident", "6");
            if (typeIdStr == null)
                return;
            const typeId = parseInt(typeIdStr);
            if (isNaN(typeId))
                return;
            this.placedBases.push({
                id: baseId,
                name: baseName,
                map_pos: [
                    Math.round(pos[0] * 100) / 100,
                    Math.round(pos[1] * 100) / 100
                ],
                type_id: typeId
            });
        }

        static getDisplayName(): string {
            return "[Dev] Place Base Markers";
        }

        static getId(): string {
            return "base-markers";
        }
    }
}
