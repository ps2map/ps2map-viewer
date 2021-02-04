/// <reference path="./amerish_svgs.ts" />

// This path is relative to the source HTML
const mapTextureDir = "./img/map";


/**
 * A custom type used for two-value tuples denoting position
 */
type PointXY = {
    x: number;
    y: number;
}


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
    private zoomLevel: number = 0.5;
    public continent: string;
    public viewport: HTMLDivElement;
    public map: HTMLDivElement;

    constructor(viewport: HTMLDivElement, map: HTMLDivElement, continent: string) {
        this.viewport = viewport;
        this.map = map;
        this.continent = continent;

        // Prevent browser text selection of map layers
        map.addEventListener("selectstart", this.preventSelection);

        // hard-coded dummy LOD for now
        const lod = MapTileLod.LOD0;

        // Load layers
        const mapTextureLayer = <HTMLDivElement>document.getElementById("mapTextureLayer");
        this.loadMapTiles(mapTextureLayer, continent, lod);
        const hexesLayer = <HTMLDivElement>document.getElementById("mapHexLayer");
        this.loadMapHexes(hexesLayer, continent)

        // Attach map pan and zoom hooks
        map.addEventListener("wheel", this.mapZoomCallback.bind(this));
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

    // Internals


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
        const numTiles = 2 ** (maxLod - lod);
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
                layer.innerHTML += `<div style="background-image: url(${tile})"></div>`;
            }
        }
    }

    /**
     * Load the
     * @param layer
     */
    private loadMapHexes(layer: HTMLDivElement, continent: string): void {
        layer.innerHTML = svg_strings;
    }

    private applyZoomLevel(): void {
        document.documentElement.style.setProperty("--MAP-SIZE", `${4096 * this.zoomLevel}px`)
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
     * Adjust map zoom when scrolling.
     *
     * To be registered as the callback for the `"wheel"` event.
     * @param event The mouse wheel event
     */
    private mapZoomCallback(event: WheelEvent): void {
        event.preventDefault();
        this.zoomLevel = event.deltaY < 0 ? this.zoomLevel * 1.2 : this.zoomLevel * 0.8;
        // Constrain zoom level
        if (this.zoomLevel < 0.2) {
            this.zoomLevel = 0.2;
        }
        else if (this.zoomLevel > 4.0) {
            this.zoomLevel = 4.0;
        }
        this.applyZoomLevel();
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

        const initialOffsetLeft = map.offsetLeft;
        const initialOffsetTop = map.offsetTop;

        function mapPanDrag(dragEvent: MouseEvent): void {
            const deltaX = dragEvent.clientX - event.clientX;
            const deltaY = dragEvent.clientY - event.clientY;
            const newLeft = initialOffsetLeft + deltaX;
            const newTop = initialOffsetTop + deltaY;
            /**
             * @todo: This is currently not taking zoom levels into account
             * and is generally sketchy. But it does prevent the map from
             * being lost in space and becoming undraggable, so it stays.
             */
            if (-map.clientWidth < newLeft && newLeft < 0) {
                map.style.left = `${newLeft}px`;
            }
            if (-map.clientHeight < newTop && newTop < 0) {
                map.style.top = `${newTop}px`;
            }
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