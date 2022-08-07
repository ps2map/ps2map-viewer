/// <reference path="./interfaces/index.ts" />

/**
 * Repository for static game data.
 *
 * This class is implemented as a singleton and must be manually loaded upon
 * application startup using the async load() method. After loading, you can
 * retrieve the singleton instance using the getInstance() method.
 */
class GameData {
    // Singleton-related fields
    private static _instance: GameData;
    private static _loading: Promise<GameData>;
    private static _loaded: boolean = false;

    // Game data fields
    private _continents: Continent[];
    private _servers: Server[];
    private _bases: Base[];

    private constructor() {
        this._continents = [];
        this._servers = [];
        this._bases = [];
    }

    // Getters

    public continents(): Continent[] { return this._continents; }

    public servers(): Server[] { return this._servers; }

    public getBase(id: number): Base | undefined {
        return this._bases.find(b => b.id === id);
    }

    public getFaction(id: number): { [key: string]: string } {
        // TODO: Load faction data from API
        switch (id) {
            case 0: return { code: "ns" };
            case 1: return { code: "vs" };
            case 2: return { code: "nc" };
            case 3: return { code: "tr" };
            default: throw new Error(`Invalid faction ID ${id}`);
        }
    }

    public async setActiveContinent(
        continent: Continent | undefined,
    ): Promise<void> {
        this._bases = [];
        if (continent)
            return fetchBasesForContinent(continent.id)
                .then(bases => {
                    this._bases = bases;
                });
        else
            return Promise.resolve();
    }

    /**
     * Loads the game data from the API.
     */
    public static async load(): Promise<GameData> {
        if (this._loaded)
            return this._instance;
        if (this._loading)
            return this._loading;
        // Otherwise, start loading the data
        this._loading = this._loadInternal();
        return this._loading;
    }

    /**
     * Returns the singleton instance of the game data.
     *
     * This method must be called after the data has been loaded.
     */
    public static getInstance(): GameData {
        if (!this._loaded)
            throw new Error("Game data not loaded");
        return this._instance;
    }

    private static async _loadInternal(): Promise<GameData> {
        return Promise.all([fetchContinents(), fetchServers()])
            .then(([continents, servers]) => {
                const instance = new GameData();
                instance._continents = continents;
                instance._servers = servers;
                this._instance = instance;
                this._loaded = true;
                return instance;
            });
    }
}
