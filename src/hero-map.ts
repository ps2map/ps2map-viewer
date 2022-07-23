/// <reference path="./map-engine/renderer.ts" />
/// <reference path="./api/index.ts" />
/// <reference path="./layers/index.ts" />
/// <reference path="./events.ts" />

/**
 * Custom map controller for primary PlanetSide 2 continent map.
 * 
 * This also includes a mini-map because reasons.
 */
class HeroMap {

    /** Internal map renderer and input handler. */
    readonly renderer: MapRenderer;

    // Semi-persistent state (require map reload on change)

    /** Active continent. */
    private _continent: Api.Continent | undefined = undefined;
    /** Active game server. */
    private _server: Api.Server | undefined = undefined;

    // Dynamic state (changeable on the fly)

    /** Local base ownership cache for the current continent. */
    private _baseOwnershipMap: Map<number, number> = new Map();
    /** Polling timer for base ownership updates via REST API. */
    private _baseUpdateIntervalId: number | undefined = undefined;

    constructor(viewport: HTMLDivElement) {
        this.renderer = new MapRenderer(viewport, 0);
    }

    // Properties & getters/setters

    continent(): Api.Continent { return this._continent!; }

    server(): Api.Server { return this._server!; }

    updateBaseOwnership(baseOwnershipMap: Map<number, number>): void {
        /** Helper function for filtering dynamic layers from static ones */
        function supportsBaseOwnership(object: any): object is SupportsBaseOwnership {
            return "updateBaseOwnership" in object;
        }

        this.renderer?.forEachLayer((layer) => {
            if (supportsBaseOwnership(layer))
                layer.updateBaseOwnership(baseOwnershipMap);
        });
    }

    async switchContinent(continent: Api.Continent): Promise<void> {
        if (continent.code == this._continent?.code)
            return;

        // Create layers for the new target continent
        const terrain = TerrainLayer.factory(continent, "terrain");
        const hexes = BasePolygonsLayer.factory(continent, "hexes");
        const lattice = LatticeLayer.factory(continent, "lattice");
        const names = BaseNamesLayer.factory(continent, "names");

        await Promise.all([terrain, hexes, lattice, names]).then(
            (layers) => {
                // Delete old layers
                this.renderer.clearLayers();
                // Update map size (required for camera)
                this.renderer.setMapSize(continent.map_size);
                this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });
                // Add new layers and force a redraw
                layers.forEach((layer) => {
                    this.renderer.addLayer(layer);
                    layer.updateLayer();
                });

                // TODO: This feels out of place
                const hexes_layer = this.renderer.getLayer("hexes")! as BasePolygonsLayer;
                const names_layer = this.renderer.getLayer("names")! as BaseNamesLayer;
                hexes_layer.element.addEventListener("ps2map_basehover", (event) => {
                    const evt = event as CustomEvent<BaseHoverEvent>;
                    names_layer.onBaseHover(evt.detail.baseId, evt.detail.element);
                });

                // Update the current continent
                this._continent = continent;

                // Start polling for base ownership updates
                this._startMapStatePolling();

                this.renderer.viewport.dispatchEvent(
                    Events.continentChangedFactory(continent));
            });
    }

    async switchServer(server: Api.Server): Promise<void> {
        if (server.id == this._server?.id)
            return;
        this._server = server;

        // Restart map state polling loop
        this._startMapStatePolling();
    }

    private _pollBaseOwnership(): void {
        const serverId = this._server?.id;
        const continentId = this._continent?.id;
        if (serverId == undefined || continentId == undefined)
            return;

        // TODO: Use a timeout to prevent the promise from taking forever
        const poll = Api.getBaseOwnership(continentId, serverId);
        poll.then((data) => {
            // Create a copy of the map to avoid mutating the original
            const baseOwnershipMap = new Map(this._baseOwnershipMap);
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
            this.updateBaseOwnership(baseOwnershipMap);
            this.renderer.viewport.dispatchEvent(
                Events.baseOwnershipChangedFactory(baseOwnershipMap));
        });
    }

    jumpTo(point: Point): void {
        this.renderer?.jumpTo(point);
    }

    private _startMapStatePolling() {
        this._baseOwnershipMap.clear();
        if (this._baseUpdateIntervalId != undefined)
            clearInterval(this._baseUpdateIntervalId);
        this._pollBaseOwnership();
        this._baseUpdateIntervalId = setInterval(() => {
            this._pollBaseOwnership();
        }, 5000);
    }

}