/// <reference path="./map-engine/renderer.ts" />
/// <reference path="./interfaces/index.ts" />
/// <reference path="./layers/index.ts" />

/**
 * Custom map controller for primary PlanetSide 2 continent map.
 * 
 * This also includes a mini-map because reasons.
 */
class HeroMap {

    readonly renderer: MapRenderer;
    private _continent: Continent | undefined = undefined;

    constructor(viewport: HTMLDivElement) {
        this.renderer = new MapRenderer(viewport, 0);
    }

    continent(): Continent { return this._continent!; }

    updateBaseOwnership(baseOwnershipMap: Map<number, number>): void {
        const data = GameData.getInstance();
        // Filter the base ownership map to only include bases that are in the
        // current continent
        const continentMap = new Map<number, number>();
        baseOwnershipMap.forEach((owner, baseId) => {
            const base = data.getBase(baseId);
            if (base && base.continent_id == this._continent?.id)
                continentMap.set(baseId, owner);
        });
        /** Helper function for filtering dynamic layers from static ones */
        function supportsBaseOwnership(object: any): object is SupportsBaseOwnership {
            return "updateBaseOwnership" in object;
        }
        // Forward the base ownership map to all dynamic layers
        this.renderer.forEachLayer((layer) => {
            if (supportsBaseOwnership(layer))
                layer.updateBaseOwnership(continentMap);
        });
    }

    async switchContinent(continent: Continent): Promise<void> {
        if (continent.code == this._continent?.code)
            return;

        // Create layers for the new target continent
        const terrain = TerrainLayer.factory(continent, "terrain");
        const hexes = BasePolygonsLayer.factory(continent, "hexes");
        const lattice = LatticeLayer.factory(continent, "lattice");
        const names = BaseNamesLayer.factory(continent, "names");

        await Promise.all([terrain, hexes, lattice, names]).then(
            (layers) => {
                // Delete old layers
                this.renderer.clearLayers();
                // Update map size (required for camera)
                this.renderer.setMapSize(continent.map_size);
                this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });
                // Add new layers and force a redraw
                layers.forEach((layer) => {
                    this.renderer.addLayer(layer);
                    layer.updateLayer();
                });

                // Update the current continent
                this._continent = continent;
            });
    }

    jumpTo(point: Point): void {
        this.renderer?.jumpTo(point);
    }

}
