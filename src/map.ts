/// <reference path="./amerish_svgs.ts" />

// This path is relative to the source HTML
const mapTextureDir = "./img/map";
// The base resolution of the map texture
const mapTextureResolution = 8192;


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
                layer.innerHTML += `<div style="background-image: url(${tile})"></div>`;
            }
        }
    }

    /**
     * Load the SVG base outlines for the given continent into the given layer.
     * @param layer Div container to populate with the SVG.
     * @param continent Name of the continent to load.
     */
    private loadMapHexes(layer: HTMLDivElement, continent: string): void {
        layer.innerHTML = svg_strings;
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

        // Constrain zoom level
        if (newZoom < this.minZoom) {
            newZoom = this.minZoom;
        }
        else if (newZoom > this.maxZoom) {
            newZoom = this.maxZoom;
        }

        // Calculate the map size change in pixels
        const pixelDelta = this.viewportMinorAxis * newZoom - this.viewportMinorAxis * this.zoom;

        // Get the position of the mouse cursor relative to the map itself
        const mapRelX = (event.clientX - this.map.offsetLeft) / this.map.clientWidth;
        const mapRelY = (event.clientY - this.map.offsetTop) / this.map.clientHeight;

        // Calculate the new map position
        let newLeft = this.map.offsetLeft - pixelDelta * mapRelX;
        let newTop = this.map.offsetTop - pixelDelta * mapRelY;

        // Apply new zoom level
        this.applyZoomLevel(newZoom);
        // Apply camera offset
        this.panCamera(newLeft, newTop);
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
        const panCamera = this.panCamera.bind(this);

        const initialOffsetLeft = map.offsetLeft;
        const initialOffsetTop = map.offsetTop;

        function mapPanDrag(dragEvent: MouseEvent): void {
            const deltaX = dragEvent.clientX - event.clientX;
            const deltaY = dragEvent.clientY - event.clientY;
            const newLeft = initialOffsetLeft + deltaX;
            const newTop = initialOffsetTop + deltaY;
            panCamera(newLeft, newTop);
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

    private panCamera(newLeft: number, newTop: number): void {
        this.map.style.left = `${newLeft}px`;
        this.map.style.top = `${newTop}px`;
        const zoomLimitX = this.viewport.clientWidth - this.map.clientWidth;
        const zoomLimitY = this.viewport.clientHeight - this.map.clientHeight;
        // Horizontal limits (map wider than viewport)
        if (this.viewport.clientWidth < this.map.clientWidth) {
            // Left
            if (this.map.offsetLeft > 0) {
                this.map.style.left = "0px";
            }
            // Right
            else if (this.map.offsetLeft < zoomLimitX) {
                this.map.style.left = `${zoomLimitX}px`;

            }
        }
        // Horizontal limits (viewport wider than map)
        else {
            // Left
            if (this.map.offsetLeft < 0) {
                this.map.style.left = "0px";
            }
            // Right
            else if (this.map.offsetLeft > zoomLimitX) {
                this.map.style.left = `${zoomLimitX}px`;
            }
        }
        // Vertical limits (map taller than viewport)
        if (this.viewport.clientHeight < this.map.clientHeight) {
            // Top
            if (this.map.offsetTop > 0) {
                this.map.style.top = "0px";
            }
            // Bottom
            else if (this.map.offsetTop < zoomLimitY) {
                this.map.style.top = `${zoomLimitY}px`;

            }
        }
        // Vertical limits (viewport taller than map)
        else {
            // Top
            if (this.map.offsetTop < 0) {
                this.map.style.top = "0px";
            }
            // Bottom
            else if (this.map.offsetTop > zoomLimitY) {
                this.map.style.top = `${zoomLimitY}px`;
            }
        }
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