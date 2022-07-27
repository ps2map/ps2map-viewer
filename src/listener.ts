

class MapListener {

    private _subscribers: ((arg0: string, arg1: any) => void)[];
    private _baseUpdateIntervalId: number | undefined;
    private _server: Server | undefined;

    constructor(server: Server | undefined = undefined) {
        this._server = server;
        this._subscribers = [];
        this._baseUpdateIntervalId = undefined;
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

    public switchServer(server: Server): void {
        this._server = server;
        this._startMapStatePolling();
    }

    private async _pollBaseOwnership(): Promise<void> {
        if (!this._server)
            return;

        fetchContinents().then((continents) => {
            const status: Promise<BaseStatus[]>[] = [];
            continents.forEach((continent) => {
                status.push(fetchBaseStatus(continent.id, this._server!.id));
            });
            const baseOwnership = new Map<number, number>();
            Promise.all(status).then((results) => {
                results.forEach((status) => {
                    status.forEach((base) => {
                        baseOwnership.set(base.base_id, base.owning_faction_id);
                    });
                });
            }).then(() => {
                this.notify("baseCaptured", baseOwnership);
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
