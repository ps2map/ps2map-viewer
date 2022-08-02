/// <reference path="./tool.ts" />
/// <reference path="./cursor.ts" />
/// <reference path="./base-info.ts" />
/// <reference path="./eraser.ts" />
/// <reference path="./brush.ts" />

document.addEventListener("DOMContentLoaded", () => {

    const availableTools = [Tool, Cursor, BaseInfo, Eraser, Brush];
    const toolInstances = new Map<string, Tool>();

    // Create toolbar buttons
    const toolbar_container = document.getElementById("toolbar-container") as HTMLDivElement;
    toolbar_container.innerHTML = "";
    availableTools.forEach(tool => {
        const btn = document.createElement("input");
        btn.type = "button";
        btn.value = tool.displayName;
        btn.classList.add("toolbar__button");
        btn.id = `tool-${tool.id}`;
        btn.addEventListener("click", () => {
            StateManager.dispatch(State.toolbox.setTool, tool.id);
        });
        toolbar_container.appendChild(btn);
    });

    // Tool hotkeys
    document.addEventListener("keydown", event => {
        let tool = "";
        if (event.key === "Escape")
            tool = "none";
        else
            availableTools.forEach(t => {
                if (event.key === t.hotkey)
                    tool = t.hotkey === null ? "none" : t.id;
            });
        if (!tool)
            return;
        StateManager.dispatch(State.toolbox.setTool, tool);
    });
    StateManager.subscribe(State.toolbox.setTool, state => {
        // Create the tool if it does not exist
        if (!toolInstances.has(state.toolbox.current || "")) {
            const map = state.toolbox.map;
            if (!map)
                return;
            const toolPanel = document.getElementById("tool-panel") as HTMLDivElement;
            availableTools.forEach(tool => {
                if (tool.id === state.toolbox.current)
                    toolInstances.set(
                        tool.id,
                        new tool(map.renderer.viewport, map, toolPanel));
            });
        }
        toolInstances.forEach((instance, id) => {
            if (instance.isActive() && id !== state.toolbox.current)
                instance.deactivate();
            if (!instance.isActive() && id === state.toolbox.current)
                instance.activate();
        });
        document.querySelectorAll(".toolbar__button").forEach(btn => {
            if (btn.id === `tool-${state.toolbox.current}`)
                btn.classList.add("toolbar__button__active");
            else
                btn.classList.remove("toolbar__button__active");
        });
    });
});
