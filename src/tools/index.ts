/// <reference path="./tool.ts" />
/// <reference path="./crosshair.ts" />
/// <reference path="./devtools/dev-base-markers.ts" />

// Global variable storing the currently active tool.
let currentTool: Tool | undefined = undefined;

let heroMap: MapRenderer | undefined = undefined;

function setupToolbox(map: MapRenderer): void {
    heroMap = map;
}

function setTool(tool: typeof Tool | undefined = undefined): void {
    currentTool?.deactivate()
    if (tool == undefined)
        tool = Tool; // Use default
    const newTool = new tool(document.getElementById("hero-map") as HTMLDivElement, (heroMap as MapRenderer));
    newTool.activate()
    currentTool = newTool;

    const tool_name_field = document.getElementById("toolbar_tool");
    if (tool_name_field)
        tool_name_field.innerText = newTool.getDisplayName();
}

function resetTool(): void {
    setTool();
}

document.addEventListener("DOMContentLoaded", () => {
    resetTool();
});
