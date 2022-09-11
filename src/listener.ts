

class MapListener {

    private _subscribers: ((arg0: string, arg1: never) => void)[];
    private _baseUpdateIntervalId: number | null;
    private _server: Server | undefined;

    constructor(server: Server | undefined = undefined) {
        this._server = server;
        this._subscribers = [];
        this._baseUpdateIntervalId = null;
    }

    public subscribe(callback: (arg0: string, arg1: never) => void) {
        this._subscribers.push(callback);
    }

    public unsubscribe(callback: (arg0: string, arg1: never) => void) {
        this._subscribers = this._subscribers.filter(subscriber => subscriber !== callback);
    }

    public notify(event: string, data: never) {
        this._subscribers.forEach(subscriber => subscriber(event, data));
    }

    public clear() {
        this._subscribers = [];
    }

    public switchServer(server: Server): void {
        this._server = server;
        this._startMapStatePolling();
    }

    private async _pollBaseOwnership(): Promise<void> {
        if (!this._server)
            return;

        fetchContinents().then(continents => {
            const bases: Promise<BaseStatus[]>[] = [];
            continents.forEach(continent => {
                if (!this._server)
                    return;
                bases.push(fetchBaseStatus(continent.id, this._server.id));
            });
            const baseOwnership = new Map<number, number>();
            Promise.all(bases).then(results => {
                results.forEach(status => {
                    status.forEach(base => {
                        baseOwnership.set(base.base_id, base.owning_faction_id);
                    });
                });
            }).then(() => {
                this.notify("baseCaptured", baseOwnership as never);
            });
        });
    }

    private _startMapStatePolling() {
        if (this._baseUpdateIntervalId)
            clearInterval(this._baseUpdateIntervalId);
        this._pollBaseOwnership();
        this._baseUpdateIntervalId = setInterval(() => {
            this._pollBaseOwnership();
        }, 5000);
    }
}
