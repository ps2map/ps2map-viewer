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

    constructor(viewport: HTMLDivElement) {
        this.renderer = new MapRenderer(viewport, 0);
    }

    // Properties & getters/setters

    continent(): Api.Continent { return this._continent!; }

    server(): Api.Server { return this._server!; }

    updateBaseOwnership(baseOwnershipMap: Map<number, number>): void {
        const data = GameData.getInstance();
        const continentMap = new Map<number, number>();
        baseOwnershipMap.forEach((value, key) => {
            if (data.getBase(key)?.continent_id == this._continent?.id)
                continentMap.set(key, value);
        });
        /** Helper function for filtering dynamic layers from static ones */
        function supportsBaseOwnership(object: any): object is SupportsBaseOwnership {
            return "updateBaseOwnership" in object;
        }

        this.renderer?.forEachLayer((layer) => {
            if (supportsBaseOwnership(layer))
                layer.updateBaseOwnership(continentMap);
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

                // Update the current continent
                this._continent = continent;
            });
    }

    async switchServer(server: Api.Server): Promise<void> {
        if (server.id == this._server?.id)
            return;
        this._server = server;
    }

    jumpTo(point: Point): void {
        this.renderer?.jumpTo(point);
    }

}
