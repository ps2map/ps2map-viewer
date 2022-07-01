/// <reference path="./map-engine/renderer.ts" />
/// <reference path="./api/index.ts" />
/// <reference path="./layers/hex-layer.ts" />

/**
 * Details for the "ps2map_continentchange" custom event.
 */
interface ContinentChangeEvent {
    continent: Api.Continent;
}

/**
 * Details for the "ps2map_baseownershipchanged" custom event.
 */
interface BaseOwnershipChangedEvent {
    baseId: number;
    factionId: number;
}

/**
 * Custom map controller for primary PlanetSide 2 continent map.
 * 
 * This also includes a mini-map because reasons.
 */
class HeroMap {
    /** Currently active continent for the map. */
    private continent: Api.Continent | undefined = undefined;
    /** Currently active server for live map state. */
    private server: Api.Server | undefined = undefined;
    /** Map engine instance responsible for hanlding the map display.  */
    private controller: MapRenderer;
    /** Viewport element the map is rendered into. */
    private viewport: HTMLDivElement;

    /** Local base ownership cache for the current continent. */
    private baseOwnershipMap: Map<number, number> = new Map();
    /** Polling timer for base ownership updates via REST API. */
    private baseUpdateIntervalId: number | undefined = undefined;

    constructor(
        viewport: HTMLDivElement
    ) {
        this.viewport = viewport;
        this.controller = new MapRenderer(this.viewport, 0);
        // Set up toolbox
        setupToolbox(this.controller);
    }

    setBaseOwnership(baseId: number, factionId: number): void {
        if (this.baseOwnershipMap.get(baseId) == factionId)
            return;
        this.baseOwnershipMap.set(baseId, factionId);
        // Forward base ownership change to all map layers
        this.controller?.forEachLayer((layer) => {
            switch (layer.id) {
                case "hexes":
                    (layer as BasePolygonsLayer).setBaseOwnership(baseId, factionId);
                    break;
                case "names":
                    (layer as BaseNamesLayer).setBaseOwnership(baseId, factionId);
                    break;
                case "lattice":
                    (layer as LatticeLayer).updateBaseOwnership(baseId, this.baseOwnershipMap);
                    break;
            }
        });
        this.viewport.dispatchEvent(
            this.buildBaseOwnershipChangedEvent(baseId, factionId));
    }

    setContinent(continent: Api.Continent): void {
        if (continent.code == this.continent?.code)
            return;
        this.continent = continent;

        // Delete all existing layers
        this.controller.clearLayers();
        this.controller.setMapSize(continent.map_size);

        // Create terrain layer
        const terrain = new TerrainLayer("terrain", continent.map_size);
        terrain.setContinent(continent.code);
        terrain.updateLayer();
        this.controller.addLayer(terrain);

        // Create base outline layer
        // TODO: Move the layer loading logic to the layer itself
        const hexes = new BasePolygonsLayer("hexes", continent.map_size);
        Api.getContinentOutlinesSvg(continent)
            .then((svg) => {
                svg.classList.add("ps2map__base-hexes__svg");
                hexes.element.appendChild(svg);
                hexes.applyPolygonHoverFix(svg);
            })
        this.controller.addLayer(hexes);

        // Create lattice layer
        const lattice = new LatticeLayer("lattice", continent.map_size);
        lattice.setContinent(continent);
        this.controller.addLayer(lattice);

        // Create base name layer
        const names = new BaseNamesLayer("names", continent.map_size);
        Api.getBasesFromContinent(continent.id)
            .then((bases) => {
                names.loadBaseInfo(bases);
                names.updateLayer();
            });
        this.controller.addLayer(names);

        hexes.element.addEventListener("ps2map_basehover", (event) => {
            const evt = event as CustomEvent<BaseHoverEvent>;
            names.onBaseHover(evt.detail.baseId, evt.detail.element);
        });

        // TODO: Move base info panel to a separate component
        // let bases: Api.Base[] = [];
        // Api.getBasesFromContinent(continent.id).then((data) => bases = data);
        // const regionName = document.getElementById("widget_base-info_name") as HTMLSpanElement;
        // const regionType = document.getElementById("widget_base-info_type") as HTMLSpanElement;
        // hexes.element.addEventListener("ps2map_basehover", (event) => {
        //     const evt = event as CustomEvent<BaseHoverEvent>;
        //     let i = bases.length;
        //     while (i-- > 0) {
        //         const base = bases[i];
        //         if (base.id == evt.detail.baseId) {
        //             regionName.innerText = base.name;
        //             regionType.innerText = base.type_name;
        //             return;
        //         }
        //     }
        // });

        // Start polling for base ownership updates
        this.startMapStatePolling();

        // Reset camera to the center of the map
        this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });

        this.viewport.dispatchEvent(
            this.buildContinentChangedEvent(continent));
    }

    setServer(server: Api.Server): void {
        if (server.id == this.server?.id)
            return;
        this.server = server;

        // Restart map state polling loop
        this.startMapStatePolling();
    }

    updateBaseOwnership(): void {
        // TODO: Add safeguard against multiple updates at once in case of long-running requests
        const server_id = this.server?.id;
        const continentId = this.continent?.id;
        if (server_id == undefined || continentId == undefined)
            return;
        Api.getBaseOwnership(continentId, server_id).then((data) => {
            let i = data.length;
            while (i-- > 0)
                this.setBaseOwnership(data[i].base_id, data[i].owning_faction_id);
        });
    }

    jumpTo(point: Point): void {
        this.controller?.jumpTo(point);
    }

    private startMapStatePolling() {
        this.baseOwnershipMap.clear();
        if (this.baseUpdateIntervalId != undefined)
            clearInterval(this.baseUpdateIntervalId);
        this.updateBaseOwnership();
        this.baseUpdateIntervalId = setInterval(() => {
            this.updateBaseOwnership();
        }, 5000);
    }

    private buildBaseOwnershipChangedEvent(baseId: number, factionId: number): CustomEvent<BaseOwnershipChangedEvent> {
        return new CustomEvent("ps2map_baseownershipchanged", {
            detail: {
                baseId: baseId,
                factionId: factionId
            },
            bubbles: true,
            cancelable: true,
        });
    }

    private buildContinentChangedEvent(continent: Api.Continent): CustomEvent<ContinentChangeEvent> {
        return new CustomEvent("ps2map_continentchanged", {
            detail: {
                continent: continent
            },
            bubbles: true,
            cancelable: true,
        });
    }
}