/// <reference path="./map-layer.ts" />
/// <reference path="./types.ts" />

/** Helper object storing tile texture, grid position, and map area. */
class MapTile {
    /** HTML element associated with this tile. */
    readonly element: HTMLElement;
    /** Grid position of the map tile. */
    readonly gridPos: GridPos;
    /** Map area of the tile. */
    readonly box: Box;
    /** Visibility DOM cache. */
    visible: boolean = true;

    constructor(box: Box, element: HTMLElement, gridPos: GridPos) {
        this.box = box;
        this.element = element;
        this.gridPos = gridPos;
    }
}

/**
 * Tile-based MapLayer implementation.
 * 
 * Tile layers come in different scales and are made up of many small raster or
 * vector tiles. These are then shown or hidden depending on the camera
 * position and zoom level.
 * 
 * Tiles are generally all the same base size, but the map area they cover
 * changes with the current zoom level.
 */
abstract class TileLayer extends MapLayer {
    /** Internal timer used for deferred LOD updates. */
    private layerUpdateTimerId: number | null = null;

    /** Current level of detail for terrain tiles. */
    protected lod: number;
    /** Map tiles for the current grid. */
    protected tiles: MapTile[] = [];

    constructor(id: string, mapSize: number, initialLod: number) {
        super(id, mapSize);
        this.lod = initialLod;
    }

    /** Redefine the CSS grid and populate it with new tiles. */
    protected setUpGrid(gridSize: number): void {
        const newTiles: MapTile[] = [];
        // Define CSS grid
        this.element.style.setProperty(
            "--ps2map__terrain__grid-size", gridSize.toFixed());
        const tileSize = this.mapSize / gridSize;
        this.element.style.setProperty(
            "--ps2map__terrain__tile-size", `${tileSize.toFixed()}px`)
        // Y loop has to count negative as it is populated top-to-bototm
        let y = gridSize;
        while (y-- > 0) {
            // X loop is positive, left-to-right
            for (let x = 0; x < gridSize; x++) {
                const pos: GridPos = {
                    x: x,
                    y: y
                };
                const tile = this.createTile(pos, gridSize);
                // Lazy-load the background image as it is loaded
                const url = this.generateTilePath(pos, this.lod);
                let img: HTMLImageElement | null = new Image();
                img.onload = () => {
                    tile.element.style.backgroundImage = `url(${url})`;
                    img = null;
                };
                img.src = url;
                newTiles.push(tile);
            }
        }
        // Add tiles
        this.element.innerHTML = "";
        const offset = newTiles.length - 1;
        let i = newTiles.length;
        while (i-- > 0)
            this.element.appendChild(newTiles[offset - i].element);
        this.tiles = newTiles;
    }

    /**
     * Factory method for map tiles.
     * @param pos Grid index of the tile to create
     * @param gridSize Number of rows/columns in the grid
     * @returns Map tile instance to place in the grid
     */
    protected abstract createTile(pos: GridPos, gridSize: number): MapTile;

    /**
     * Generate the path to a given grid tile.
     * @param pos Grid index of the tile
     * @param lod Current level of detail
     * @returns Full path to the given tile asset
     */
    protected abstract generateTilePath(pos: GridPos, lod: number): string;

    /**
     * Return whether the given tile overlaps with the viewbox.
     * @param tile Map tile to check for viewbox intersection
     * @param viewbox Current client viewbox
     * @returns true if the tile is in view, otherwise false
     */
    protected tileIsVisible(tile: MapTile, viewbox: Box): boolean {
        return Utils.rectanglesIntersect(tile.box, viewbox);
    }

    /**
     * Update the CSS visibility of all map tiles.
     * @param viewbox Current viewbox to apply
     */
    protected updateTileVisibility(viewbox: Box): void {
        let i = this.tiles.length;
        while (i-- > 0) {
            const tile = this.tiles[i];
            if (this.tileIsVisible(tile, viewbox))
                tile.element.style.removeProperty("visibility");
            else
                tile.element.style.visibility = "hidden";
        }
    }

    /**
     * Determine if new tiles need to be loaded (i.e. new LOD levels).
     * 
     * This is called as part of the deferred layer update after a zoom
     * transformation was applied.
     * @param viewbox Current viewbox
     * @param zoom Current zoom level to calculate
     */
    protected updateTiles(viewbox: Box, zoom: number): void {
        this.updateTileVisibility(viewbox);
    }

    redraw(viewbox: Box, zoom: number): void {
        const targetX = (viewbox.right + viewbox.left) * 0.5;
        const targetY = (viewbox.top + viewbox.bottom) * 0.5;
        // Initial offset to move the centre of the SVG to its CSS origin
        const halfMapSize = this.mapSize * 0.5;
        let offsetX = -halfMapSize;
        let offsetY = -halfMapSize;
        // Another offset to shift the viewbox target to the origin
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom; // -1 to fix Y axis origin
        // Apply transform
        this.element.style.transform = (
            `matrix(${zoom}, 0.0, 0.0, ${zoom}, ${offsetX}, ${offsetY})`);
        // Schedule layer resize after transition animation finished
        if (this.layerUpdateTimerId != null)
            clearTimeout(this.layerUpdateTimerId);
        this.layerUpdateTimerId = setTimeout(
            this.updateTiles.bind(this), 200, viewbox, zoom);
    }
}