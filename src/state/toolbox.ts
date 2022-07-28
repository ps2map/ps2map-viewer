/// <reference path="../interfaces/index.ts" />

namespace State {

    export interface ToolBoxState {
        current: string | undefined;
        data: object;
    };

    export const defaultToolState: ToolBoxState = {
        current: undefined,
        data: {},
    };

    /** State reducer for "tool/" actions. */
    export function toolboxReducer(
        state: ToolBoxState,
        action: string,
        data: any
    ): ToolBoxState {
        switch (action) {
            case "toolbox/changed":
                return {
                    ...state,
                    current: data.id,
                    data: data.data,
                };
            default:
                return state;
        }
    }
}
