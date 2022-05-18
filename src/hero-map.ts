/// <reference path="./map-engine/renderer.ts" />
/// <reference path="./api/getters.ts" />
/// <reference path="./layers/hex-layer.ts" />
/// <reference path="./minimap.ts" />

/**
 * Custom map controller for primary PlanetSide 2 continent map.
 * 
 * This also includes a mini-map because reasons.
 */
class HeroMap {
    /** Current continent ID */
    private continentId: number;
    /** Internal map renderer wrapped by this class. */
    private controller: MapRenderer;

    /** Minimap DOM container. */
    private readonly minimap: Minimap;

    constructor(
        viewport: HTMLDivElement,
        initialContinentId: number
    ) {
        this.continentId = initialContinentId;

        // TODO: Query the API to determine the appropriate map size for the
        // given continent
        const mapSize = 8192;

        // Initialise map controller
        this.controller = new MapRenderer(viewport, mapSize);
        // Set up minimap
        const minimapElement = document.getElementById("minimap");
        if (minimapElement == null)
            throw "Unable to locate minimap element.";
        if (minimapElement.tagName != "DIV")
            throw "Minimap element must be a DIV";
        // FIXME: Hard-coded minimap URL for now
        this.minimap = new Minimap(minimapElement as HTMLDivElement,
            mapSize, Api.getMinimapImagePath('esamir'));
        this.controller.viewboxCallbacks.push(
            this.minimap.setViewbox.bind(this.minimap));
        this.minimap.jumpToCallbacks.push(
            this.controller.jumpTo.bind(this.controller));

        // Add map layer for terrain texture
        const terrainLayer = new TerrainLayer("terrain", mapSize);
        // Load continent data
        Api.getContinent(this.continentId).then((continent) => {
            terrainLayer.setContinent(continent.code);
            terrainLayer.updateLayer();
        });
        this.controller.addLayer(terrainLayer);

        // Add map layer for base hexes
        const hexLayer = new HexLayer("hexes", mapSize);
        // Load continent data
        Api.getContinent(this.continentId)
            // Fetch base outlines
            .then((continent) => {
                return fetch(`${Api.getApiEndpoint()}static/hex/${continent.code}-minimal.svg`);
            })
            // Get raw text response (i.e. the SVG literal)
            .then((data) => {
                return data.text();
            })
            // Load the SVG literal into the layer
            .then((payload) => {
                hexLayer.element.appendChild(hexLayer.svgFactory(payload));
                hexLayer.updateLayer();
            });
        this.controller.addLayer(hexLayer);

        // Add map layer for base names
        const namesLayer = new BaseNamesLayer("names", mapSize);
        // Load continent data
        Api.getBasesFromContinent(this.continentId)
            .then((bases) => {
                namesLayer.loadBaseInfo(bases);
                namesLayer.updateLayer();
            });

        this.controller.addLayer(namesLayer);

        hexLayer.polygonHoverCallbacks.push(
            namesLayer.onBaseHover.bind(namesLayer));

        // Base info panel
        let bases: Api.Base[] = [];
        Api.getBasesFromContinent(this.continentId).then((data) => bases = data);
        const regionName = document.getElementById("widget_base-info_name") as HTMLSpanElement;
        const regionType = document.getElementById("widget_base-info_type") as HTMLSpanElement;
        hexLayer.polygonHoverCallbacks.push((baseId: number) => {
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
    }
}