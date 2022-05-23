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
    private controller: MapRenderer | undefined = undefined;
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
    }

    setBaseOwnership(baseId: number, factionId: number): void {
        if (this.baseOwnershipMap.get(baseId) == factionId)
            return;
        this.baseOwnershipMap.set(baseId, factionId);
        // Update map layers
        this.controller?.forEachLayer((layer) => {
            if (layer.id == "hexes") {
                (layer as HexLayer).setBaseOwner(baseId, factionId);
            }
        })
        let i = this.onBaseOwnershipChanged.length;
        while (i-- > 0)
            this.onBaseOwnershipChanged[i](baseId, factionId);
    }

    setContinent(continent: Api.Continent): void {
        if (continent.code == this.continent?.code)
            return;
        this.continent = continent;
        const mapSize = continent.map_size;

        let i = this.onContinentChanged.length;
        while (i-- > 0)
            this.onContinentChanged[i](continent);

        // TODO: don't recreate controller
        delete this.controller
        i = this.viewport.children.length;
        while (i-- > 0)
            this.viewport.removeChild(this.viewport.children[i]);

        // Set up controller
        this.controller = new MapRenderer(this.viewport, mapSize);
        this.controller.onViewboxChanged.push((viewbox) => {
            let i = this.onViewboxChanged.length;
            while (i-- > 0)
                this.onViewboxChanged[i](viewbox);
        });

        // Add map layer for terrain texture
        const terrainLayer = new TerrainLayer("terrain", mapSize);
        // Load continent data
        terrainLayer.setContinent(continent.code);
        terrainLayer.updateLayer();
        this.controller.addLayer(terrainLayer);

        // Add map layer for base hexes
        // TODO: Move the layer loading logic to the layer itself
        const hexLayer = new HexLayer("hexes", mapSize);
        Api.getContinentOutlinesSvg(continent)
            .then((svg) => {
                svg.classList.add("ps2map__base-hexes__svg");
                hexLayer.element.appendChild(svg);
                hexLayer.applyPolygonHoverFix(svg);
            })
        this.controller.addLayer(hexLayer);

        // Add map layer for base names
        const namesLayer = new BaseNamesLayer("names", mapSize);
        // Load continent data
        Api.getBasesFromContinent(continent.id)
            .then((bases) => {
                namesLayer.loadBaseInfo(bases);
                namesLayer.updateLayer();
            });

        this.controller.addLayer(namesLayer);

        hexLayer.onBaseHover.push(
            namesLayer.onBaseHover.bind(namesLayer));

        // Base info panel
        let bases: Api.Base[] = [];
        Api.getBasesFromContinent(continent.id).then((data) => bases = data);
        const regionName = document.getElementById("widget_base-info_name") as HTMLSpanElement;
        const regionType = document.getElementById("widget_base-info_type") as HTMLSpanElement;
        hexLayer.onBaseHover.push((baseId: number) => {
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

        this.continent = continent;
        if (this.baseUpdateIntervalId != undefined) {
            clearInterval(this.baseUpdateIntervalId);
        }
        this.updateBaseOwnership(); // Update once before interval times out
        this.baseUpdateIntervalId = setInterval(() => {
            this.updateBaseOwnership();
        }, 5000);
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