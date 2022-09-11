/// <reference path="./map-engine/index.ts" />
/// <reference path="./interfaces/index.ts" />
/// <reference path="./layers/index.ts" />

/** Custom map controller for primary PlanetSide 2 continent map. */
class HeroMap extends MapEngine {

    private _continent: Continent | undefined = undefined;

    constructor(viewport: HTMLDivElement) {
        super(viewport);
    }

    getCanvasContext(): CanvasRenderingContext2D {
        const elem = this.viewport.querySelector<HTMLCanvasElement>("canvas");
        if (!elem)
            throw new Error("No canvas element found");
        const ctx = elem.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get canvas context");
        return ctx;
    }

    public getLayer<Type extends MapLayer>(id: string): Type {
        const layer = this.layers.getLayer(id);
        if (!layer)
            throw new Error(`Layer '${id}' does not exist`);
        return layer as Type;
    }

    updateBaseOwnership(map: Map<number, number>): void {
        const data = GameData.getInstance();
        // Filter the base ownership map to only include bases that are in the
        // current continent
        const continentMap = new Map<number, number>();
        map.forEach((owner, baseId) => {
            const base = data.getBase(baseId);
            if (base && base.continent_id === this._continent?.id)
                continentMap.set(baseId, owner);
        });
        /** Helper function for filtering dynamic layers from static ones */
        function supportsBaseOwnership(object: object,
        ): object is SupportsBaseOwnership {
            return "updateBaseOwnership" in object;
        }
        // Forward the base ownership map to all dynamic layers
        this.layers.forEachLayer(layer => {
            if (supportsBaseOwnership(layer))
                layer.updateBaseOwnership(continentMap);
        });
    }

    async switchContinent(continent: Continent): Promise<void> {
        if (continent.code === this._continent?.code)
            return;

        // Create layers for the new target continent
        const allLayers = [
            TerrainLayer.factory(continent, "terrain"),
            BasePolygonsLayer.factory(continent, "hexes"),
            LatticeLayer.factory(continent, "lattice"),
            BaseNamesLayer.factory(continent, "names"),
            CanvasLayer.factory(continent, "canvas"),
        ];

        await Promise.all(allLayers).then(layers => {
            // Remove old layers
            this.layers.clear();

            // Update map size if new continent's size is different
            const size = continent.map_size;
            if (this._mapSize.width !== size) {
                this.setMapSize({ width: size, height: size });
            }
            this.camera.resetZoom();
            this.jumpTo({ x: size / 2, y: size / 2 });
            // Add new layers
            layers.forEach(layer => {
                this.layers.addLayer(layer);
                layer.updateLayer();
            });

            this._continent = continent;
        });
    }

    jumpTo(point: Point): void {
        this.camera.jumpTo(point);
        this.renderer.redraw();
        this.dispatchViewportChangedEvent();
    }

    public jumpToBase(baseId: number): void {
        const base = GameData.getInstance().getBase(baseId);
        if (base) {
            const [x, y] = base.map_pos;
            this.camera.resetZoom(true);
            for (let i = 0; i < 4; i++)
                this.camera.bumpZoom(1);
            this.jumpTo({ x, y });
        }
    }
}
