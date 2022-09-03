/// <reference path="./index.ts" />

type _Subs = Map<string, ((state: State.AppState, data: unknown) => void)[]>;

class StateManager {
    private static _state: State.AppState = {
        map: State.defaultMapState,
        toolbox: State.defaultToolboxState,
        user: State.defaultUserState,
    };
    private static readonly _subscriptions: _Subs = new Map();

    static dispatch(action: string, data: never): void {
        const newState = this._update(action, data);

        if (newState === this._state) {
            console.warn(`StateManager: dispatch: no change for action "${action}"`);
            return;
        }
        this._state = newState;

        const subscriptions = this._subscriptions.get(action);
        if (subscriptions)
            subscriptions.forEach(callback => callback(this._state, data));
    }

    static subscribe(action: string, callback: (state: State.AppState, data: unknown) => void): void {
        let subscriptions = this._subscriptions.get(action);
        if (!subscriptions) {
            subscriptions = [];
            this._subscriptions.set(action, subscriptions);
        }
        subscriptions.push(callback);
    }

    static unsubscribe(action: string, callback: (state: State.AppState, data: unknown) => void): void {
        const subscriptions = this._subscriptions.get(action);
        if (!subscriptions)
            return;
        const index = subscriptions.indexOf(callback);
        if (index < 0)
            return;
        subscriptions.splice(index, 1);
    }

    static getState(): State.AppState {
        return this._state;
    }

    private static _update(action: string, data: never): State.AppState {
        return State.appReducer(this._state, action, data);
    }
}
