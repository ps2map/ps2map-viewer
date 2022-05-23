/// <reference path="./map-engine/renderer.ts" />
/// <reference path="./api/index.ts" />
/// <reference path="./layers/hex-layer.ts" />

/**
 * Custom map controller for primary PlanetSide 2 continent map.
 * 
 * This also includes a mini-map because reasons.
 */
class HeroMap {
    /** Currently active continent for the map. */
    private continent: Api.Continent | undefined = undefined;
    /** Map engine instance responsible for hanlding the map display.  */
    private controller: MapRenderer;
    /** Viewport element the map is rendered into. */
    private viewport: HTMLDivElement;

    /** Local base ownership cache for the current continent. */
    private baseOwnershipMap: Map<number, number> = new Map();
    /** Polling timer for base ownership updates via REST API. */
    private baseUpdateIntervalId: number | undefined = undefined;

    /** Callbacks to invoke when the continent is changed. */
    onContinentChanged: ((continent: Api.Continent) => void)[] = [];
    /** Callbacks to invoke when a base changes ownership. */
    onBaseOwnershipChanged: ((baseId: number, factionId: number) => void)[] = [];
    /** Callbacks to invoke when the viewbox changes. */
    onViewboxChanged: ((viewbox: Box) => void)[] = [];

    constructor(
        viewport: HTMLDivElement
    ) {
        this.viewport = viewport;
        this.controller = new MapRenderer(this.viewport, 0);
        this.controller.onViewboxChanged.push((viewbox) => {
            let i = this.onViewboxChanged.length;
            while (i-- > 0)
                this.onViewboxChanged[i](viewbox);
        });
    }

    setBaseOwnership(baseId: number, factionId: number): void {
        if (this.baseOwnershipMap.get(baseId) == factionId)
            return;
        this.baseOwnershipMap.set(baseId, factionId);
        // Forward base ownership change to all map layers
        this.controller?.forEachLayer((layer) => {
            if (layer.id == "hexes")
                (layer as HexLayer).setBaseOwnership(baseId, factionId);
        });
        // Run external base ownership change callbacks
        let i = this.onBaseOwnershipChanged.length;
        while (i-- > 0)
            this.onBaseOwnershipChanged[i](baseId, factionId);
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
        const hexes = new HexLayer("hexes", continent.map_size);
        Api.getContinentOutlinesSvg(continent)
            .then((svg) => {
                svg.classList.add("ps2map__base-hexes__svg");
                hexes.element.appendChild(svg);
                hexes.applyPolygonHoverFix(svg);
            })
        this.controller.addLayer(hexes);

        // Create base name layer
        const names = new BaseNamesLayer("names", continent.map_size);
        Api.getBasesFromContinent(continent.id)
            .then((bases) => {
                names.loadBaseInfo(bases);
                names.updateLayer();
            });
        this.controller.addLayer(names);

        hexes.onBaseHover.push(
            names.onBaseHover.bind(names));

        // TODO: Move base info panel to a separate component
        let bases: Api.Base[] = [];
        Api.getBasesFromContinent(continent.id).then((data) => bases = data);
        const regionName = document.getElementById("widget_base-info_name") as HTMLSpanElement;
        const regionType = document.getElementById("widget_base-info_type") as HTMLSpanElement;
        hexes.onBaseHover.push((baseId: number) => {
            let i = bases.length;
            while (i-- > 0) {
                const base = bases[i];
                if (base.id == baseId) {
                    regionName.innerText = base.name;
                    regionType.innerText = base.type_name;
                    return;
                }
            }
        });

        // Run external continent change callbacks
        let i = this.onContinentChanged.length;
        while (i-- > 0)
            this.onContinentChanged[i](continent);

        // Start polling for base ownership updates
        this.baseOwnershipMap.clear();
        if (this.baseUpdateIntervalId != undefined)
            clearInterval(this.baseUpdateIntervalId);
        this.updateBaseOwnership();
        this.baseUpdateIntervalId = setInterval(() => {
            this.updateBaseOwnership();
        }, 5000);

        // Reset camera to the center of the map
        this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });
    }

    updateBaseOwnership(): void {
        // TODO: Add safeguard against multiple updates at once in case of long-running requests
        // TODO: Add dynamic server selection
        const server_id = 13;
        const continentId = this.continent?.id;
        if (continentId == undefined)
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

}