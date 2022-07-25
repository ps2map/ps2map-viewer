/// <reference path="../interfaces/index.ts" />

namespace State {

    export interface UserState {
        server: Server | undefined;
        continent: Continent | undefined;
        hoveredBase: Base | undefined;
    };

    export const defaultUserState: UserState = {
        server: undefined,
        continent: undefined,
        hoveredBase: undefined,
    };

    /** State reducer for "user/" actions. */
    export function userReducer(state: UserState, action: string, data: any): UserState {
        switch (action) {
            case "user/serverChanged":
                return {
                    ...state,
                    server: data
                };
            case "user/continentChanged":
                return {
                    ...state,
                    continent: data
                };
            case "user/baseHovered":
                return {
                    ...state,
                    hoveredBase: data
                };
            default:
                return state;
        }
    }

}