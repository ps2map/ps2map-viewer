/// <reference path="./tool.ts" />
/// <reference path="./crosshair.ts" />
/// <reference path="./devtools/dev-base-markers.ts" />

// Global variable storing the currently active tool.
let currentTool: Tool | undefined = undefined;

let heroMap: MapRenderer | undefined = undefined;
const available_tools = [Tool, Crosshair, DevTools.BaseMarkers];

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
    document.querySelectorAll(".toolbar__button").forEach((btn) => {
        if (btn.id == `tool-${tool?.getId()}`)
            btn.classList.add("toolbar__button__active");
        else
            btn.classList.remove("toolbar__button__active");
    });
}

function resetTool(): void {
    setTool();
}

document.addEventListener("DOMContentLoaded", () => {

    // Create toolbar buttons
    const toolbar_container = document.getElementById("toolbar-container") as HTMLDivElement;
    toolbar_container.innerHTML = "";
    available_tools.forEach((tool) => {
        const btn = document.createElement("input");
        btn.type = "button";
        btn.value = tool.getDisplayName();
        btn.classList.add("toolbar__button");
        btn.id = `tool-${tool.getId()}`;

        btn.addEventListener("click", () => {
            setTool(tool);
        });

        toolbar_container.appendChild(btn);
    });

    // Reset tool on ESC
    document.addEventListener("keydown", (event) => {
        if (event.key == "Escape")
            resetTool();
    });

});
