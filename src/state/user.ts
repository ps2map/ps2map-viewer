namespace State {

    export interface UserState {
        server: Api.Server | undefined;
        continent: Api.Continent | undefined;
    }

    export const defaultUserState: UserState = {
        server: undefined,
        continent: undefined,
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
            default:
                return state;
        }
    }

}
