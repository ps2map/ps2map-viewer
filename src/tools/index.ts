/// <reference path="./tool.ts" />
/// <reference path="./cursor.ts" />

// Global variable storing the currently active tool.
let currentTool: Tool | undefined = undefined;

let heroMap: HeroMap | undefined = undefined;
const available_tools = [Tool, Cursor];

function setupToolbox(map: HeroMap): void {
    heroMap = map;
}

function setTool(tool: typeof Tool | undefined = undefined): void {
    if (currentTool)
        currentTool.tearDown();
    if (!tool || currentTool instanceof tool)
        tool = Tool;  // Deselect
    const toolBar = document.getElementById("tool-panel") as HTMLDivElement;
    if (!toolBar)
        return;
    const newTool = new tool(document.getElementById("hero-map") as HTMLDivElement, (heroMap as HeroMap), toolBar);
    currentTool = newTool;
    document.querySelectorAll(".toolbar__button").forEach((btn) => {
        if (btn.id === `tool-${tool?.id}`)
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
        btn.value = tool.displayName;
        btn.classList.add("toolbar__button");
        btn.id = `tool-${tool.id}`;

        btn.addEventListener("click", () => {
            setTool(tool);
        });

        toolbar_container.appendChild(btn);
    });

    // Reset tool on ESC
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape")
            resetTool();
    });

});
