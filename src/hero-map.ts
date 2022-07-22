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

    continent(): Api.Continent {
        return this._continent!;
    }

    server(): Api.Server {
        return this._server!;
    }

    // TODO: Why is this public
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

    setContinent(continent: Api.Continent): void {
        if (continent.code == this._continent?.code)
            return;
        this._continent = continent;

        // Delete all existing layers
        this.renderer.clearLayers();
        this.renderer.setMapSize(continent.map_size);

        // Create terrain layer
        const terrain = new TerrainLayer("terrain", continent.map_size);
        terrain.setContinent(continent.code);
        terrain.updateLayer();
        this.renderer.addLayer(terrain);

        // Create base outline layer
        // TODO: Move the layer loading logic to the layer itself
        const hexes = new BasePolygonsLayer("hexes", continent.map_size);
        Api.getContinentOutlinesSvg(continent)
            .then((svg) => {
                svg.classList.add("ps2map__base-hexes__svg");
                hexes.element.appendChild(svg);
                hexes.applyPolygonHoverFix(svg);
            });
        this.renderer.addLayer(hexes);

        // Create lattice layer
        const lattice = new LatticeLayer("lattice", continent.map_size);
        lattice.setContinent(continent);
        this.renderer.addLayer(lattice);
        lattice.element.addEventListener("ps2map_baseownershipchanged", (event) => {
            const evt = event as CustomEvent<Events.BaseOwnershipChanged>;
            const map = new Map();
            map.set(evt.detail.baseId, evt.detail.factionId);
            lattice.updateBaseOwnership(evt.detail.baseId, map);
        });

        // Create base name layer
        // TODO: Move the layer loading logic to the layer itself
        const names = new BaseNamesLayer("names", continent.map_size);
        Api.getBasesFromContinent(continent.id)
            .then((bases) => {
                names.loadBaseInfo(bases);
                names.updateLayer();
            });
        this.renderer.addLayer(names);
        hexes.element.addEventListener("ps2map_basehover", (event) => {
            const evt = event as CustomEvent<BaseHoverEvent>;
            names.onBaseHover(evt.detail.baseId, evt.detail.element);
        });

        // Start polling for base ownership updates
        this.startMapStatePolling();

        // Reset camera to the center of the map
        this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });

        this.renderer.viewport.dispatchEvent(
            Events.continentChangedFactory(continent));
    }

    setServer(server: Api.Server): void {
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