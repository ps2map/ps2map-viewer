/// <reference path="./zoom.ts" />
/// <reference path="./layers/base.ts" />
/// <reference path="./layers/baseNameLayer.ts" />
/// <reference path="./layers/hexLayer.ts" />
/// <reference path="./layers/tileLayer.ts" />
/// <reference path="./debug_tile_colour.ts" />

/**
 * This file handles the map object and its interactions.
 */

/**
 * Main controller for map interactions and rendering.
 */
class MapController extends Zoomable {
    // The zoomLevel is the amount of magnification relative to the
    // minimum map size, i.e. the map being completely zoomed out, with
    // its height and width being equal to the shorter axis of the
    // viewport.
    private continentId: number;
    private layers: Array<MapLayer> = [];
    readonly map: HTMLDivElement;

    constructor(
        map: HTMLDivElement,
        mapContainer: HTMLDivElement,
        viewport: HTMLDivElement,
        initialContinentId: number
    ) {
        super(mapContainer, viewport, 1.0);
        this.map = map;
        this.continentId = initialContinentId;

        // Create layers

        const terrain = this.createTileLayer(
            "layer-terrain",
            initialContinentId,
            "http://127.0.0.1:5000/static/tile/"
        );
        this.layers.push(terrain);
        const hexes = this.createHexLayer("layer-hexes", initialContinentId);
        this.layers.push(hexes);
        const names = this.createBaseNameLayer(
            "layer-names",
            initialContinentId
        );
        this.layers.push(names);

        // Register zoom callbacks

        this.registerZoomCallback(terrain.onZoom.bind(terrain));
        this.registerZoomCallback(names.onZoom.bind(names));

        // Debug base painter

        hexes.layer.addEventListener("auxclick", (evt: MouseEvent) => {
            if (!(evt.target instanceof SVGPolygonElement) || evt.button != 1) {
                return;
            }
            names.setBaseOwnership(
                parseInt(evt.target.id),
                cycleFactionColour(evt.target)
            );
        });
    }

    /**
     * Switch the map to a different continent.
     * @param continentId ID of the continent to switch to.
     * @param force By default, this function does nothing if the
     * current continent is already equal to the given continent ID.
     * Setting this flag will regenerate the map regardless of the
     * current continent ID, effectively refreshing the map.
     */
    public switchContinent(continentId: number, force: boolean = false): void {
        if (continentId == this.continentId && !force) {
            console.debug("Continent switch skipped; already on this map");
            return;
        }
        this.continentId = continentId;
        this.layers.forEach((layer) => {
            layer.switchContinent(continentId, force);
        });
    }

    private createTileLayer(
        layerId: string,
        initialContinentId: number,
        tileBaseUrl: string
    ): TileLayer {
        const div = document.createElement("div");
        div.id = layerId;
        div.classList.add("map__layer", "layer-terrain");
        this.map.appendChild(div);
        return new TileLayer(div, initialContinentId, tileBaseUrl);
    }

    private createHexLayer(
        layerId: string,
        initialContinentId: number
    ): HexLayer {
        const div = document.createElement("div");
        div.id = layerId;
        div.classList.add("map__layer", "layer-hexes");
        this.map.appendChild(div);
        return new HexLayer(div, initialContinentId);
    }

    private createBaseNameLayer(
        layerId: string,
        initialContinentId: number
    ): BaseNameLayer {
        const div = document.createElement("div");
        div.id = layerId;
        div.classList.add("map__layer", "layer-names");
        this.map.appendChild(div);
        return new BaseNameLayer(div, initialContinentId);
    }
}
