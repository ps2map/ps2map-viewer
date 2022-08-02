/**
 * Redux-inspired state management.
 */

/// <reference path="./map.ts" />
/// <reference path="./toolbox.ts" />
/// <reference path="./user.ts" />

namespace State {

    export interface AppState {
        map: MapState;
        toolbox: ToolBoxState;
        user: UserState;
    }

    export function appReducer(state: AppState, action: string, data: any): AppState {
        return {
            map: mapReducer(state.map, action, data),
            toolbox: toolboxReducer(state.toolbox, action, data),
            user: userReducer(state.user, action, data),
        };
    }
}
