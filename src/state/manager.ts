/// <reference path="./index.ts" />

class StateManager {
    private static _state: State.AppState = {
        map: State.defaultMapState,
        tool: State.defaultToolState,
        user: State.defaultUserState,
    };
    private static _subscriptions: Map<string, ((state: State.AppState) => void)[]> = new Map();

    static dispatch(action: string, data: any): void {
        const newState = this._update(action, data);

        if (newState === this._state) {
            console.warn(`StateManager: dispatch: no change for action "${action}"`);
            return;
        }
        this._state = newState;

        const subscriptions = this._subscriptions.get(action);
        if (subscriptions)
            subscriptions.forEach(callback => callback(this._state));
    }

    static subscribe(action: string, callback: (state: State.AppState) => void): void {
        let subscriptions = this._subscriptions.get(action);
        if (!subscriptions)
            this._subscriptions.set(action, subscriptions = []);
        subscriptions.push(callback);
    }

    static unsubscribe(action: string, callback: (state: State.AppState) => void): void {
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

    private static _update(action: string, data: any): State.AppState {
        return State.appReducer(this._state, action, data);
    }
}
