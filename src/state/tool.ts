/// <reference path="../interfaces/index.ts" />

namespace State {

    export interface ToolState {
        current: string | undefined;
        data: object;
    };

    export const defaultToolState: ToolState = {
        current: undefined,
        data: {},
    };

    /** State reducer for "tool/" actions. */
    export function toolReducer(state: ToolState, action: string, data: any): ToolState {
        switch (action) {
            case "tool/changed":
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