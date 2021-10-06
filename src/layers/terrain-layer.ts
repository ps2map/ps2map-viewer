/// <reference path="../map-engine/tile-layer.ts" />

/**
 * Continent terrain texture layer subclass.
 */
class TerrainLayer extends TileLayer {
    /** Internal identifier for the current tileset. */
    private code: string = "";

    constructor(id: string, mapSize: number) {
        super(id, mapSize, 3);
        this.element.classList.add("ps2map__terrain");
    }

    /**
     * Update the current continent.
     * 
     * If the continent is different to the previous value, all tiles are
     * recreated at the current zoom level.
     * @param code 
     */
    setContinent(code: string): void {
        if (this.code == code)
            return;
        this.code = code;
        // Add low-res background buffer for antialiasing and preloading
        this.element.style.backgroundImage = (
            `url(http://127.0.0.1:5000/static/minimap/${code}.jpg)`);
        // Generate grid
        const gridSize = this.mapTilesPerAxis(this.mapSize, this.lod);
        this.setUpGrid(gridSize);
    }

    /**
     * Determine the tile LOD for the given zoom level
     * @param zoom Zoom level to use for calculation
     * @returns Tile LOD for this zoom level
     */
    private calculateLod(zoom: number): number {
        // Compensate for custom DPI scaling (avoids blur on high DPI screens)
        const adjustedZoom = zoom * devicePixelRatio;
        if (adjustedZoom < 0.125)
            return 3;
        if (adjustedZoom < 0.25)
            return 2;
        if (adjustedZoom < 0.5)
            return 1;
        return 0;

    }

    protected createTile(pos: GridPos, gridSize: number): MapTile {
        const mapStep = this.mapSize / gridSize;
        const box = {
            left: mapStep * pos.x,
            right: mapStep * (pos.x + 1),
            top: mapStep * (pos.y + 1),
            bottom: mapStep * pos.y,
        };
        // Create tile element
        const element = document.createElement("div");
        element.classList.add("ps2map__terrain__tile");
        return new MapTile(box, element, pos);
    }

    /**
     * Convert a tile grid coordinate into the game's three-character format.
     * @param value Tile grid coordinate to convert
     * @returns String version of the coordinate
     */
    private formatTileCoordinate(value: number): string {
        const negative = value < 0;
        let coord = Math.abs(value).toFixed();
        if (coord.length < 3)
            coord = ("00" + coord).slice(-3);
        if (negative)
            coord = "-" + coord.slice(1);
        return coord;
    }

    protected generateTilePath(pos: GridPos, lod: number): string {
        const [tileX, tileY] = this.gridPosToTilePos(pos, lod);
        const coordX = this.formatTileCoordinate(tileX);
        const coordY = this.formatTileCoordinate(tileY);
        const filename = `${this.code}_tile_${coordX}_${coordY}_lod${lod}.jpeg`;
        return `http://127.0.0.1:5000/static/tile/${filename}`;
    }

    /**
     * Convert grid index positions to the tile grid coordinates
     * @param pos Grid position of the tile
     * @param lod Current level of detail
     * @returns Grid position in tile grid coordinates
     */
    private gridPosToTilePos(pos: GridPos, lod: number): [number, number] {
        const min = this.mapGridLimits(this.mapSize, lod)[0];
        const stepSize = this.mapStepSize(this.mapSize, lod);
        return [min + (stepSize * pos.x), min + (stepSize * pos.y)];
    }

    /**
     * Return the step size in the tile grid for the given map.
     * @param mapSize Map size in metres
     * @param lod Map level of detail
     * @returns Map tile grid step size
     */
    private mapStepSize(mapSize: number, lod: number): number {
        if (lod == 0)
            // Base case for all map sizes
            return 4;
        if (lod == 1 || mapSize <= 1024)
            // Past LOD0, very small maps (e.g. old Tutorial) do not scale past 8
            return 8;
        if (lod == 2 || mapSize <= 2048)
            // Past LOD1, small maps (e.g. VR training or Nexus) do not scale past 16
            return 16;
        // LOD3 base case for large maps (i.e. Koltyr and up)
        return 32;
    }

    /**
     * Return the number of map tiles for a given map and LOD.
     * @param mapSize Map size in metres
     * @param lod Map level of detail
     * @returns Number of tiles in the map grud (both axes)
     */
    private mapTileCount(mapSize: number, lod: number): number {
        return Math.ceil(4 ** (Math.floor(Math.log2(mapSize)) - 8 - lod));
    }

    /**
     * Return the number of grid tiles for a single axis.
     * @param mapSize Map size in metres
     * @param lod Map level of detail
     * @returns Number of tiles per axis
     */
    private mapTilesPerAxis(mapSize: number, lod: number): number {
        return Math.floor(Math.sqrt(this.mapTileCount(mapSize, lod)))
    }

    /**
     * Return the map grid limits for a given map and LOD.
     * 
     * These are the minimum and maximum grid indices for the map grid.
     * @param mapSize Map size in metres
     * @param lod Map level of detail
     * @returns Map tile grid limits (min/max, the same for both axes)
     */
    private mapGridLimits(mapSize: number, lod: number): [number, number] {
        const stepSize = this.mapStepSize(mapSize, lod);
        // Calculate the number of map tiles along one axis of the map
        const tilesPerAxis = this.mapTilesPerAxis(mapSize, lod);
        const halfSize = stepSize * Math.floor(tilesPerAxis / 2);
        if (halfSize <= 0)
            return [-stepSize, -stepSize];
        return [-halfSize, halfSize - stepSize];
    }

    protected updateTiles(viewbox: Box, zoom: number): void {
        const newLod = this.calculateLod(zoom);
        // Update layer drawing style
        if (zoom * devicePixelRatio > 2)
            this.element.style.imageRendering = "pixelated";
        else
            this.element.style.removeProperty("image-rendering");
        // Check if new LODs are required
        if (newLod == this.lod) {
            // Update tile visibilities only
            this.updateTileVisibility(viewbox);
            return;
        }
        // Update LOD and regenerate tiles
        this.lod = newLod;
        this.setUpGrid(this.mapTilesPerAxis(this.mapSize, newLod));
    }
}
