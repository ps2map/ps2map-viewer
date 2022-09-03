/// <reference path="../interfaces/index.ts" />

namespace State {

    export namespace toolbox {
        export const setup = "toolbox/setup";
        export const setTool = "toolbox/setTool";
    }

    export interface ToolBoxState {
        current: string | null;
        map: HeroMap | null;
    }

    export const defaultToolboxState: ToolBoxState = {
        current: null,
        map: null,
    };

    /** State reducer for "tool/" actions. */
    export function toolboxReducer(
        state: ToolBoxState,
        action: string,
        data: never,
    ): ToolBoxState {
        switch (action) {
            case toolbox.setup:
                return {
                    ...state,
                    ...defaultToolboxState,
                    map: (data as any).map,
                };
            case toolbox.setTool:
                return {
                    ...state,
                    current: (data as any).id,
                };
            default:
                return state;
        }
    }
}
