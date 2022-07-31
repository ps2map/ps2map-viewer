/// <reference path="../interfaces/index.ts" />

namespace State {

    export namespace user {
        export const continentChanged = "user/continentChanged";
        export const serverChanged = "user/serverChanged";
        export const baseHovered = "user/baseHovered";
        export const canvasUpdated = "user/canvasUpdated";
        export const canvasLineAdded = "user/canvasLineAdded";
        export const canvasStrokeErase = "user/canvasStrokeErase";
    }

    export interface UserState {
        server: Server | undefined;
        continent: Continent | undefined;
        hoveredBase: Base | null;
        canvas: Point[][];
    };

    export const defaultUserState: UserState = {
        server: undefined,
        continent: undefined,
        hoveredBase: null,
        canvas: [],
    };

    /** State reducer for "user/" actions. */
    export function userReducer(state: UserState, action: string, data: any): UserState {
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
            case user.canvasLineAdded:
                const newCanvas = [...state.canvas];
                newCanvas.push(data);
                return {
                    ...state,
                    canvas: newCanvas,
                };
            case user.canvasStrokeErase:
                return {
                    ...state,
                    canvas: polyLineStrokeErase(state.canvas, data),
                };
            default:
                return state;
        }
    }

}
