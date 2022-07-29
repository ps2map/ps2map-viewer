namespace State {

    export namespace map {
        export const baseCaptured = "map/baseCaptured";
    }

    export interface MapState {
        baseOwnership: Map<number, number>;
    }

    export const defaultMapState: MapState = {
        baseOwnership: new Map<number, number>(),
    };

    /** State reducer for "map/" actions. */
    export function mapReducer(state: MapState, action: string, data: any): MapState {
        switch (action) {
            case State.map.baseCaptured:
                return {
                    ...state,
                    baseOwnership: data
                }
            default:
                return state;
        }
    }

}
