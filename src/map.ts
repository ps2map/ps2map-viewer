/// <reference path="./api/interfaces.ts" />
/// <reference path="./api/base.ts" />
/// <reference path="./api/continent.ts" />
/// <reference path="./debug_tile_colour.ts" />

// This path is relative to the source HTML
const mapTextureDir = "./img/map";
// The base resolution of the map texture
const mapTextureResolution = 8192;


/**
 * Map tile resolution enum
 *
 * These tiles are based on the sizes used in the in-game map, add new
 * ones at your own risk.
 */
enum MapTileLod {
    // The enum value corresponds to the name of the file
    LOD0 = 0,
    LOD1 = 1,
    LOD2 = 2,
    LOD3 = 3
}
const maxLod = 3;


/**
 * Global map renderer instance.
 *
 * This handles map interaction event listeners and dynamically loads
 * new tiles as zoom levels and camera position change.
 */
class MapRenderer {
    private zoom: number;
    public continent: string;
    public viewport: HTMLDivElement;
    public map: HTMLDivElement;

    constructor(viewport: HTMLDivElement, map: HTMLDivElement, continent: string) {
        this.viewport = viewport;
        this.map = map;
        this.continent = continent;
        this.zoom = this.minZoom;

        // Prevent browser text selection of map layers
        map.addEventListener("selectstart", this.preventSelection);

        // hard-coded dummy LOD for now
        const lod = this.getLodForZoomLevel(this.zoom);

        // Load layers
        const mapTextureLayer = <HTMLDivElement>document.getElementById("mapTextureLayer");
        this.loadMapTiles(mapTextureLayer, continent, lod);
        const hexesLayer = <HTMLDivElement>document.getElementById("mapHexLayer");
        this.loadMapHexes(hexesLayer, continent);
        const baseNameLayer = <HTMLDivElement>document.getElementById("mapBaseNameLayer");
        this.setBaseNames(baseNameLayer, 6);

        // Attach map pan and zoom hooks
        map.addEventListener("wheel", this.mapZoomCallback.bind(this),
            { "passive": false });
        map.addEventListener("mousedown", this.mapPan.bind(this));
    }

    // Public interface

    /**
     * Attach a checkbox to a map layer to control its visibility.
     * @param layer_id DOM ID of the layer to control
     * @param checkbox_id DOM ID of the checkbox
     */
    public layerVisibilityHook(layer_id: string, checkbox_id: string): void {
        const layer = <HTMLDivElement>document.getElementById(layer_id);
        const checkbox = <HTMLInputElement>document.getElementById(checkbox_id);
        checkbox.addEventListener("click", function (): void {
            layer.style.visibility = checkbox.checked ? "visible" : "hidden";
        });
    }

    /**
     * Get the minor axis of the viewport; i.e. the shorter side length.
     */
    private get viewportMinorAxis(): number {
        return Math.min(this.viewport.clientHeight, this.viewport.clientWidth);
    }

    /**
     * Return the minimum zoom level.
     * 
     * This returns the zoom level at which the map will just fit the viewport.
     */
    private get minZoom(): number {
        return 1;
    }

    /**
     * Return the maximum zoom leve.
     * 
     * This limits the zoom level to 1 texture pixel being the size of 2x2
     * screen pixel at maximum zoom.
     */
    private get maxZoom(): number {
        return 2 * mapTextureResolution / this.viewportMinorAxis;
    }

    /**
     * Return the number of map tiles for the given LOD level
     * @param lod The map LOD
     * @returns Bumber of tiles per axis for this LOD level
     */
    private getNumTiles(lod: MapTileLod): number {
        return 2 ** (maxLod - lod);
    }

    /**
     * Clear an repopulate a layer with map tiles of the given zoom level.
     *
     * The given layer must use a properly set up CSS grid style for the
     * tiling to work correctly.
     * @param layer The layer to insert the tiles into. Any existing inner HTML
     * will be cleared as part of this function.
     * @param [lod] The LOD level of the map tiles to use
     */
    private loadMapTiles(layer: HTMLDivElement, continent: string, lod: MapTileLod = MapTileLod.LOD1): void {
        layer.innerHTML = "";
        // Number of tiles per axis for the current map lod
        const numTiles = this.getNumTiles(lod);
        // Special case for single-tile map LOD
        if (numTiles <= 1) {
            let tile = this.getMapTilePath(continent, lod, 0, 0);
            layer.innerHTML = `<div style="background-image: url(${tile})"></div>`;
            return
        }
        // Iterate rows
        for (let y = numTiles / 2; y > -numTiles / 2 - 1; y--) {
            // Skip 0 index as we have an even number of map tiles
            if (y == 0) {
                continue;
            }
            // Iterate columns
            for (let x = -numTiles / 2; x < numTiles / 2 + 1; x++) {
                // Skip 0 index as we have an even number of map tiles
                if (x == 0) {
                    continue;
                }
                // Create a new div with the given tile as the background image
                let tile = this.getMapTilePath(continent, lod, x, y);
                let div = document.createElement("div");
                div.style.backgroundImage = `url(${tile})`;
                layer.appendChild(div);
            }
        }
    }

    /**
     * Load the SVG base outlines for the given continent into the given layer.
     * @param layer Div container to populate with the SVG.
     * @param continent Name of the continent to load.
     */
    private async loadMapHexes(layer: HTMLDivElement, continent: string): Promise<void> {
        const cInfo = await getContinentInfo(6);
        const baseMap = cInfo.map_base_svgs;
        let innerHtml = "";
        const size = Object.keys(baseMap).length;
        for (let i = 0; i < size; i++) {
            const key = Object.keys(baseMap)[i];
            innerHtml += baseMap[key];
        }
        layer.innerHTML = innerHtml;

        registerDebugFactionCycler();

        // Register map info callbacks
        for (let i = 0; i < size; i++) {
            const element = <SVGElement>layer.children[i];
            element.addEventListener("mouseenter", this.baseHoverCallback);
        }
    }

    private async baseHoverCallback(event: MouseEvent) {
        if (!(event.target instanceof SVGElement)) {
            return;
        }
        const baseId = parseInt(event.target.id);
        const bInfoList = await getBaseInfo(6);
        let bInfo = bInfoList[0];
        for (let i = 0; i < bInfoList.length; i++) {
            if (bInfoList[i].id == baseId) {
                bInfo = bInfoList[i];
            }
        }
        const baseName = <HTMLSpanElement>document.getElementById("baseName");
        baseName.innerHTML = bInfo.name;
    }

    private async setBaseNames(layer: HTMLDivElement, continent: number): Promise<void> {
        const bases = await getBaseInfo(continent);

        bases.forEach(base => {
            let container = document.createElement("div");
            let offsetX = (4120 + base.map_pos[0]) * this.zoom / 9;
            let offsetY = (4200 + base.map_pos[1]) * this.zoom / 9;
            container.style.left = `${offsetX}px`;
            container.style.bottom = `${offsetY}px`;
            let name = document.createElement("span");
            name.innerHTML = base.name;
            container.appendChild(name);
            layer.appendChild(container);
        });
    }

    /**
     * Apply the given zoom level.
     *
     * This updates both the CSS variable and the `zoom` property.
     * @param zoomLevel The new zoom level
     */
    private applyZoomLevel(zoomLevel: number): void {
        this.zoom = zoomLevel;
        const newMapSize = Math.round(this.viewportMinorAxis * zoomLevel);
        document.documentElement.style.setProperty("--MAP-SIZE", `${newMapSize}px`)
        // Update map textures
        const lod = this.getLodForZoomLevel(zoomLevel)
        const numTiles = this.getNumTiles(lod);
        const mapTextureLayer = <HTMLDivElement>document.getElementById("mapTextureLayer");
        document.documentElement.style.setProperty("--MAP-TILES-PER-AXIS", numTiles.toString());
        this.loadMapTiles(mapTextureLayer, this.continent, lod);
        // Update base name div offsets
        const mapBaseNameLayer = <HTMLDivElement>document.getElementById("mapBaseNameLayer");
        mapBaseNameLayer.innerHTML = "";
        this.setBaseNames(mapBaseNameLayer, 6);
    }

    /**
     * Return the path to a given map tile.
     *
     * `tile_x` and `tile_y` will be truncated to integers.
     * @param continent The base name of the map, e.g. "amerish"
     * @param lod The level of detail to load
     * @param tile_x Map tile X coordinate
     * @param tile_y Map tile Y coordinate
     * @returns File path to the map tile
     */
    private getMapTilePath(continent: string, lod: MapTileLod, tile_x: number, tile_y: number): string {
        return `${mapTextureDir}/${continent}/lod${lod}/lod${lod}_${Math.round(tile_x)}_${Math.round(tile_y)}.png`;
    }

    /**
     * Return the appropriate map tile LOD for the given zoom level
     * @param zoomLevel The current zoom level
     * @returns MapTileLod enum value for the given zoom level
     */
    private getLodForZoomLevel(zoomLevel: number): MapTileLod {
        if (zoomLevel >= 8) {
            return MapTileLod.LOD0;
        }
        if (zoomLevel >= 4) {
            return MapTileLod.LOD1;
        }
        if (zoomLevel >= 2) {
            return MapTileLod.LOD2;
        }
        return MapTileLod.LOD3;
    }

    /**
     * Adjust map zoom when scrolling.
     *
     * To be registered as the callback for the `"wheel"` event.
     * @param event The mouse wheel event
     */
    private mapZoomCallback(event: WheelEvent): void {
        event.preventDefault();
        let newZoom = event.deltaY < 0 ? this.zoom * 1.25 : this.zoom * 0.8;
        if (newZoom < this.minZoom) {
            newZoom = this.minZoom;
        }
        else if (newZoom > this.maxZoom) {
            newZoom = this.maxZoom;
        }
        this.applyZoomLevel(newZoom);
    }

    /**
     * Hook to trigger map panning when the user clicks the map.
     *
     * To be registered for the `"mousedown"` event for the map container.
     * @param event The mouse click event
     */
    private mapPan(event: MouseEvent): void {
        // Only allow left mouse button
        if (event.button != 0) {
            return;
        }
        const map = this.map;
        const viewport = this.viewport;
        const panStartLeft = viewport.scrollLeft;
        const panStartTop = viewport.scrollTop;

        function mapPanDrag(dragEvent: MouseEvent): void {
            const deltaX = dragEvent.clientX - event.clientX;
            const deltaY = dragEvent.clientY - event.clientY;
            viewport.scrollLeft = panStartLeft - deltaX;
            viewport.scrollTop = panStartTop - deltaY;
        }

        function mapPanEnd(): void {
            map.removeEventListener("mousemove", mapPanDrag);
            document.removeEventListener("mouseup", mapPanEnd);
        }

        // Add the map panning event as the mouse was just pressed down
        map.addEventListener("mousemove", mapPanDrag);
        // Unregister the event as soon as the mouse is released
        document.addEventListener("mouseup", mapPanEnd);
    }

    /**
     * Prevent selection of a container
     * @returns Always false
     */
    private preventSelection(): boolean {
        return false;
    }

}


/**
 * Change the visibility of a map layer according to a checkbox.
 *
 * The container"s `.style.display` attribute will be set to `"block"`
 * or `"none"` depending on whether the checkbox is checked or not.
 * @param checkbox The checkbox to check the state of
 * @param layer The HTML container to alter visibility of
 * @returns Callback to register for the checkbox"s `"clicked"` event
 */
function updateMapLayerVisibility(checkbox: HTMLInputElement, layer: HTMLDivElement): () => void {
    return function (): void {
        layer.style.visibility = checkbox.checked ? "visible" : "hidden";
    }
}


/** DEBUG */

function registerDebugFactionCycler(): void {
    const mapHexLayer = <HTMLDivElement>document.getElementById("mapHexLayer");
    mapHexLayer.addEventListener("auxclick", cycleFactionColour);
}
