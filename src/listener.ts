

class MapListener {

    private _subscribers: ((arg0: string, arg1: any) => void)[];
    /** Polling timer for base ownership updates via REST API. */
    private _baseUpdateIntervalId: number | undefined = undefined;

    constructor() {
        this._subscribers = [];
        this._startMapStatePolling();
    }

    public subscribe(callback: (arg0: string, arg1: any) => void) {
        this._subscribers.push(callback);
    }

    public unsubscribe(callback: (arg0: string, arg1: any) => void) {
        this._subscribers = this._subscribers.filter(subscriber => subscriber !== callback);
    }

    public notify(event: string, data: any) {
        this._subscribers.forEach(subscriber => subscriber(event, data));
    }

    public clear() {
        this._subscribers = [];
    }

    private async _timeout<T>(promise: Promise<T>, timeout: number): Promise<T | undefined> {
        const timeoutPromise = new Promise<undefined>(
            (resolve) => setTimeout(() => resolve(undefined), timeout));
        return Promise.race([timeoutPromise, promise]);
    }

    private async _pollBaseOwnership(): Promise<void> {
        const server = 13;
        const continents = await Api.getContinentList();
        continents.forEach(continent => {

            this._timeout(Api.getBaseOwnership(continent.id, server), 5000)
                .then((data) => {
                    if (data == undefined) {
                        console.warn('Base ownership poll timed out')
                        return;
                    }

                    // Create a copy of the map to avoid mutating the original
                    const baseOwnershipMap = new Map();
                    let i = data.length;
                    while (i-- > 0) {
                        const baseId = data[i].base_id;
                        const factionId = data[i].owning_faction_id;

                        // If the base has not changed, remove the key
                        if (baseOwnershipMap.get(baseId) == factionId)
                            baseOwnershipMap.delete(baseId);
                        // Otherwise, update the key with the new value
                        else
                            baseOwnershipMap.set(baseId, factionId);
                    }
                    this.notify('baseCaptured', baseOwnershipMap);
                });

        });
    }

    private _startMapStatePolling() {
        if (this._baseUpdateIntervalId != undefined)
            clearInterval(this._baseUpdateIntervalId);
        this._pollBaseOwnership();
        this._baseUpdateIntervalId = setInterval(() => {
            this._pollBaseOwnership();
        }, 5000);
    }

}
