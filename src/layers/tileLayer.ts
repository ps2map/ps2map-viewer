/**
 * Tile-based map layer.
 *
 * This handles the multi-LOD (level of detail) map texture tiles used
 * for the raster map textures.
 */

/// <reference path="../api/getters.ts" />
/// <reference path="./base.ts" />

const mapBaseRes = 8192;

/**
 * MapLayer subclass used to draw the terrain textures on the map.
 */
class TileLayer extends MapLayer {
    readonly tileBaseUrl: string;
    private lod: number;
    private tileSet: string;

    constructor(
        layer: HTMLDivElement,
        initialContinentId: number,
        tileBaseUrl: string
    ) {
        super(layer, initialContinentId);
        this.lod = 3;
        this.tileSet = "bogus";
        this.tileBaseUrl = tileBaseUrl;
    }

    /**
     * Switch the currently active continent.
     * @param continentId ID of the new continent to display.
     */
    public setContinent(continentId: number): void {
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        // Update the used tile set
        this.setTileSet(continentId);
    }

    /**
     * Update the map tile resolution for the new zoom level.
     * @param zoomLevel The new zoom level to use
     */
    public onZoom(zoomLevel: number): void {
        // Update map tile LOD
        let newLod = 0;
        if (zoomLevel >= 8) {
            newLod = 0;
        } else if (zoomLevel >= 4) {
            newLod = 1;
        } else if (zoomLevel >= 2) {
            newLod = 2;
        } else {
            newLod = 3;
        }
        // Update tiles for new LOD (if needed)
        if (newLod == this.lod) {
            return;
        }
        this.lod = newLod;
        // Update CSS grid
        const numTiles = this.getNumTiles(newLod);
        this.layer.style.setProperty(
            "--MAP-TILES-PER-AXIS",
            numTiles.toString()
        );
        // Redraw map tiles
        this.updateTiles();
    }

    /**
     * Switch the map tile set used.
     *
     * This updates all tile elements with the textures from the given
     * tile set.
     * @param continentId
     */
    private async setTileSet(continentId: number): Promise<void> {
        const cont = getContinent(continentId);
        cont.then((contInfo) => {
            this.tileSet = contInfo.map_tileset;
            this.updateTiles();
        });
    }

    /**
     * Redraw all map tiles for the current LOD and tile set.
     */
    private updateTiles(): void {
        const numTiles = this.getNumTiles(this.lod);
        const newTiles: Array<HTMLDivElement> = [];
        // Special case for single-tile map LOD
        if (numTiles <= 1) {
            const tile = this.getMapTilePath(
                this.tileSet.toLowerCase(),
                this.lod,
                0,
                0
            );
            newTiles.push(this.createTile(tile));
        }
        // Default case for multi-tile LODs
        else {
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
                    const tile = this.getMapTilePath(
                        this.tileSet.toLowerCase(),
                        this.lod,
                        x,
                        y
                    );
                    newTiles.push(this.createTile(tile));
                }
            }
        }
        requestAnimationFrame(() => {
            this.clear();
            newTiles.forEach((tile) => this.layer.appendChild(tile));
        });
    }

    /**
     * Factory method for map tiles.
     * @param url The URL of the tile texture.
     * @returns The request tile as a <div> element.
     */
    private createTile(url: string): HTMLDivElement {
        const tile = document.createElement("div");
        tile.style.backgroundImage = `url(${url})`;
        return tile;
    }

    /**
     * Return the number of map tiles for the given LOD level
     * @param lod The map LOD
     * @returns Bumber of tiles per axis for this LOD level
     */
    private getNumTiles(lod: number) {
        if (lod < 0) {
            throw "lod must be greater than zero";
        }
        return 2 ** (3 - lod);
    }

    /**
     * Return the path to a given map tile.
     * @param tileName base name of the map tiles, e.g. "amerish"
     * @param lod The level of detail to load
     * @param tileX Map tile X coordinate
     * @param tileY Map tile Y coordinate
     * @returns File path to the map tile
     */
    private getMapTilePath(
        tileName: string,
        lod: number,
        tileX: number,
        tileY: number
    ): string {
        return this.tileBaseUrl + `${tileName}/lod${lod}_${tileX}_${tileY}.jpg`;
    }
}
