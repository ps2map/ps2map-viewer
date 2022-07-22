/// <reference path="./map-engine/renderer.ts" />
/// <reference path="./api/index.ts" />
/// <reference path="./layers/hex-layer.ts" />
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

    // TODO: Move this to the layer class or an internal helper, not a global method
    setBaseOwnership(baseId: number, factionId: number): void {
        if (this._baseOwnershipMap.get(baseId) == factionId)
            return;
        this._baseOwnershipMap.set(baseId, factionId);
        // Forward base ownership change to all map layers
        this.renderer?.forEachLayer((layer) => {
            switch (layer.id) {
                case "hexes":
                    (layer as BasePolygonsLayer).setBaseOwnership(baseId, factionId);
                    break;
                case "names":
                    (layer as BaseNamesLayer).setBaseOwnership(baseId, factionId);
                    break;
                case "lattice":
                    (layer as LatticeLayer).updateBaseOwnership(baseId, this._baseOwnershipMap);
                    break;
            }
        });
        this.renderer.viewport.dispatchEvent(
            Events.baseOwnershipChangedFactory(baseId, factionId));
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
                this.startMapStatePolling();

                this.renderer.viewport.dispatchEvent(
                    Events.continentChangedFactory(continent));
            });
    }

    async switchServer(server: Api.Server): Promise<void> {
        if (server.id == this._server?.id)
            return;
        this._server = server;

        // Restart map state polling loop
        this.startMapStatePolling();
    }

    updateBaseOwnership(): void {
        // TODO: Add safeguard against multiple updates at once in case of long-running requests
        const server_id = this._server?.id;
        const continentId = this._continent?.id;
        if (server_id == undefined || continentId == undefined)
            return;
        Api.getBaseOwnership(continentId, server_id).then((data) => {
            let i = data.length;
            while (i-- > 0)
                this.setBaseOwnership(data[i].base_id, data[i].owning_faction_id);
        });
        // TODO: Batch updates to reduce event spam
    }

    jumpTo(point: Point): void {
        this.renderer?.jumpTo(point);
    }

    private startMapStatePolling() {
        this._baseOwnershipMap.clear();
        if (this._baseUpdateIntervalId != undefined)
            clearInterval(this._baseUpdateIntervalId);
        this.updateBaseOwnership();
        this._baseUpdateIntervalId = setInterval(() => {
            this.updateBaseOwnership();
        }, 5000);
    }

}