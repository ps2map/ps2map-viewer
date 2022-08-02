/// <reference path="../interfaces/index.ts" />

namespace State {

    export namespace toolbox {
        export const setup = "toolbox/setup";
        export const setTool = "toolbox/setTool";
    }

    export interface ToolBoxState {
        currentTool: Tool | null;
        targetMap: HeroMap | null;
        data: any;
    }

    export const defaultToolboxState: ToolBoxState = {
        currentTool: null,
        targetMap: null,
        data: {},
    };

    /** State reducer for "tool/" actions. */
    export function toolboxReducer(
        state: ToolBoxState,
        action: string,
        data: any
    ): ToolBoxState {
        switch (action) {
            case toolbox.setup:
                return {
                    ...state,
                    ...defaultToolboxState,
                    targetMap: data.map,
                };
            case toolbox.setTool:
                if (state.currentTool)
                    state.currentTool.tearDown();

                let cls: typeof Tool = data.type;
                if (!cls)
                    cls = Tool;
                let tool: Tool | null = null;

                const toolBar = document.getElementById("tool-panel") as HTMLDivElement;
                if (toolBar && state.targetMap)
                    tool = new cls(
                        state.targetMap.renderer.viewport,
                        state.targetMap,
                        toolBar,
                    );
                document.querySelectorAll(".toolbar__button").forEach(btn => {
                    if (btn.id === `tool-${cls.id}`)
                        btn.classList.add("toolbar__button__active");
                    else
                        btn.classList.remove("toolbar__button__active");
                });
                return {
                    ...state,
                    currentTool: tool,
                };
            default:
                return state;
        }
    }
}
