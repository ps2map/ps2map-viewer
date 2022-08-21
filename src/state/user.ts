/// <reference path="../interfaces/index.ts" />

namespace State {

    export namespace user {
        export const continentChanged = "user/continentChanged";
        export const serverChanged = "user/serverChanged";
        export const baseHovered = "user/baseHovered";
        export const layerVisibilityChanged = "user/layerVisibilityChanged";
    }

    export interface UserState {
        server: Server | undefined;
        continent: Continent | undefined;
        hoveredBase: Base | null;
        layerVisibility: Map<string, boolean>;
    }

    export const defaultUserState: UserState = {
        server: undefined,
        continent: undefined,
        hoveredBase: null,
        layerVisibility: new Map<string, boolean>(),
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
            case user.layerVisibilityChanged:
                const visibility = new Map(state.layerVisibility);
                visibility.set((data as any).id, (data as any).visible);
                return {
                    ...state,
                    layerVisibility: visibility,
                };
            default:
                return state;
        }
    }

}
