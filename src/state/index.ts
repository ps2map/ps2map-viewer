/**
 * Redux-inspired state management.
 */

/// <reference path="./map.ts" />
/// <reference path="./tool.ts" />
/// <reference path="./user.ts" />

namespace State {

    export interface AppState {
        map: MapState;
        tool: ToolState;
        user: UserState;
    }

    export function appReducer(state: AppState, action: string, data: any): AppState {
        return {
            map: mapReducer(state.map, action, data),
            tool: toolReducer(state.tool, action, data),
            user: userReducer(state.user, action, data),
        };
    }
}
