/// <reference path="../interfaces/index.ts" />
/// <reference path="../rest/index.ts" />
/// <reference path="../map-engine/static-layer.ts" />
/// <reference path="./base.ts" />

/**
 * Custom DOM event details dispatched when the user hovers a base.
 *
 * @param baseId - ID of the base that was hovered.
 * @param element - The SVG polygon associated with this base.
 */
interface BaseHoverEvent {
    baseId: number;
    element: SVGPolygonElement;
}

/**
 * A static layer rendering base polygons for a given continent.
 *
 * This will dispatch a "ps2map_basehover" event when the user mouse-overs a
 * base polygon.
 */
class BasePolygonsLayer extends StaticLayer implements SupportsBaseOwnership {

    readonly svg: SVGElement;

    private constructor(id: string, size: Box, svg: SVGElement) {
        super(id, size);
        this.svg = svg;
    }

    static async factory(
        continent: Continent,
        id: string,
    ): Promise<BasePolygonsLayer> {
        return fetchContinentOutlines(continent.code)
            .then(svg => {
                const size = {
                    width: continent.map_size,
                    height: continent.map_size,
                };
                const layer = new BasePolygonsLayer(id, size, svg);
                layer.element.appendChild(svg);
                layer._initialisePolygons(svg);
                // Remove "no man's land" hexes like the "Shattered Warp Gate"
                const data = GameData.getInstance();
                layer.element.querySelectorAll("polygon").forEach(element => {
                    const baseId = layer._polygonIdToBaseId(element.id);
                    if (data.getBase(baseId)?.type_code === undefined)
                        element.remove();
                });
                return layer;
            });
    }

    public updateBaseOwnership(map: Map<number, number>): void {
        map.forEach((owner, baseId) => {
            const query = `#${this._baseIdToPolygonId(baseId)}`;
            const polygon = this.svg.querySelector<SVGPolygonElement>(query);
            if (polygon) {
                if (owner !== 0) {
                    polygon.style.removeProperty("display");
                    polygon.style.fill =
                        `var(${this._factionIdToCssVar(owner)})`;
                } else {
                    polygon.style.display = "none";
                }
            } else {
                // TODO: This should not be logged at all; remove this once
                // Oshur map data is fixed.
                console.warn(`Could not find polygon for base ${baseId}`);
            }
        });
    }

    /**
     * Return the CSS variable name for the given faction.
     *
    * @param factionId - The faction ID to get the colour for.
    * @returns The CSS variable name for the faction's colour.
     */
    private _factionIdToCssVar(factionId: number): string {
        const code = GameData.getInstance().getFaction(factionId).code;
        return `--ps2map__faction-${code}-colour`;
    }

    /**
     * Create hover event listeners for all base polygons.
     *
     * This also updates the polygon's IDs to be unique within the app by
     * replacing them with "base-outline-<baseId>".
     *
     * @param svg - The SVG element containing the base polygons.
     * @returns A promise that resolves when all polygons have been updated.
     */
    private _initialisePolygons(svg: SVGElement): void {
        svg.querySelectorAll("polygon").forEach(polygon => {
            polygon.id = this._baseIdToPolygonId(polygon.id);

            // Event handler for applying hover effects
            const addHoverFx = () => {
                // This moves the existing polygon to the top of the SVG to
                // make sure the hover effect does not get overshadowed by
                // neighbouring polygons. This does *not* create a duplicate
                // and should be safe per the SVG spec.
                svg.appendChild(polygon);

                // Set up event handler for removing hover effects
                const removeHoverFx = () => {
                    polygon.style.removeProperty("stroke");
                };
                polygon.addEventListener(
                    "mouseleave", removeHoverFx, { passive: true });
                polygon.addEventListener(
                    "touchend", removeHoverFx, { passive: true });
                polygon.addEventListener(
                    "touchcancel", removeHoverFx, { passive: true });

                // Apply the hover styling itself
                polygon.style.stroke = "#ffffff";

                // Dispatch the custom hover event
                this.element.dispatchEvent(this._buildBaseHoverEvent(
                    this._polygonIdToBaseId(polygon.id), polygon));
            };
            polygon.addEventListener(
                "mouseenter", addHoverFx, { passive: true });
            polygon.addEventListener(
                "touchstart", addHoverFx, { passive: true });
        });
    }

    protected deferredLayerUpdate(_: ViewBox, zoom: number): void {
        const strokeWith = 10 / 1.5 ** zoom;
        this.svg.style.setProperty(
            "--ps2map__base-hexes__stroke-width", `${strokeWith}px`);
    }

    /**
     * Factory method for creating custom base hover events.
     *
     * @param baseId - ID of the base that was hovered.
     * @param element - The SVG polygon associated with this base.
     * @returns A custom base hover event, ready to be dispatched.
     */
    private _buildBaseHoverEvent(
        baseId: number,
        element: SVGPolygonElement,
    ): CustomEvent<BaseHoverEvent> {
        return new CustomEvent("ps2map_basehover", {
            detail: { baseId, element },
            bubbles: true,
            cancelable: true,
        });
    }

    /**
     * Convert a polygon ID to a base ID.
     *
     * This function performs no validation on the input.
     *
     * @param id - Polygon ID to convert.
     * @returns The corresponding base ID.
     */
    private _polygonIdToBaseId(id: string): number {
        // Convert the string "base-outline-<baseId>" to a number
        return parseInt(id.substring(id.lastIndexOf("-") + 1), 10);
    }

    /**
     * Convert a base ID to a polygon ID.
     *
     * @param baseId - Base ID to convert.
     * @returns The polygon ID for the given base.
     */
    private _baseIdToPolygonId(baseId: number | string): string {
        return `base-outline-${baseId}`;
    }
}
