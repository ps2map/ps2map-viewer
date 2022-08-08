/// <reference path="../interfaces/index.ts" />

namespace State {

    export namespace user {
        export const continentChanged = "user/continentChanged";
        export const serverChanged = "user/serverChanged";
        export const baseHovered = "user/baseHovered";
    }

    export interface UserState {
        server: Server | undefined;
        continent: Continent | undefined;
        hoveredBase: Base | null;
        canvas: Point[][];
    }

    export const defaultUserState: UserState = {
        server: undefined,
        continent: undefined,
        hoveredBase: null,
        canvas: [],
    };

    /** State reducer for "user/" actions. */
    export function userReducer(
        state: UserState,
        action: string,
        data: never,
    ): UserState {
        switch (action) {
            case user.serverChanged:
                return {
                    ...state,
                    server: data,
                };
            case user.continentChanged:
                return {
                    ...state,
                    continent: data,
                };
            case user.baseHovered:
                return {
                    ...state,
                    hoveredBase: data,
                };
            default:
                return state;
        }
    }

}
