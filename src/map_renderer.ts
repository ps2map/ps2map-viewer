
// 2D map rendering engine

// This path is relative to the source HTML
const map_texture_dir = './img/map';


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
enum MapTileLOD {
    // The enum value corresponds to the name of the file
    LOD0 = 0,
    LOD1 = 1,
    LOD2 = 2,
    LOD3 = 3
}


/**
 * Global map rendered instance.
 * 
 * This handles map interaction event listeners and dynamically loads
 * new tiles as zoom levels and camera position change.
 */
class MapRenderer {
    private zoomLevel: number = 1.0
    public viewport: HTMLDivElement;
    public mapContainer: HTMLDivElement;

    constructor(viewport: HTMLDivElement, mapContainer: HTMLDivElement) {
        this.viewport = viewport;
        this.mapContainer = mapContainer;
        console.log(this.getMapTilePath('amerish', MapTileLOD.LOD0, 2, -3.0));

        for (let i = 4; i > -5; i--) {
            if (i == 0) {
                continue;
            }
            for (let j = -4; j < 5; j++) {
                if (j == 0) {
                    continue;
                }
                let tile = this.getMapTilePath('amerish', MapTileLOD.LOD0, j, i);
                this.mapContainer.innerHTML += `<img src="${tile}" onmousedown="return false;" />`;
            }
        }
    }


    /**
     * Return the path to a given map tile.
     * 
     * `tile_x` and `tile_y` will be truncated to integers.
     * @param map The base name of the map, e.g. "amerish"
     * @param lod The level of detail to load
     * @param tile_x Map tile X coordinate
     * @param tile_y Map tile Y coordinate
     * @returns File path to the map tile
     */
    private getMapTilePath(map: string, lod: MapTileLOD, tile_x: number, tile_y: number): string {
        return `${map_texture_dir}/${map}/lod${lod}/lod${lod}_${tile_x}_${tile_y}.png`;
    }


    /**
     * Return the appropriate map texture scale for the currenz zoom level.
     * 
     * @returns A whole-number denoting the texture resolution to use.
     */
    private calculateTextureResolution(): MapTileLOD {
        // Things to add:
        //   Check for screen size
        //   Check for available textures
        //   Check for max resolution limit

        // The below is a placeholder and does not take screen size into account
        if (this.zoomLevel <= 0.2) {
            return MapTileLOD.LOD3;
        }
        if (this.zoomLevel <= 0.5) {
            return MapTileLOD.LOD2;
        }
        if (this.zoomLevel <= 0.9) {
            return MapTileLOD.LOD1;
        }
        return MapTileLOD.LOD0;
    }
}