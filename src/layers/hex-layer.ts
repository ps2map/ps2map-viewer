/// <reference path="../map-engine/static-layer.ts" />

/**
 * Base outlines (aka. hexes) layer subclass.
 * 
 * This is a static layer used to interact with base hexes.
 */
class HexLayer extends StaticLayer {
    /** A list of callbacks to invoke when a base polygon is hovered. */
    polygonHoverCallbacks: ((arg0: number, arg1: SVGPolygonElement) => void)[] = [];

    constructor(id: string, mapSize: number) {
        super(id, mapSize);
        this.element.classList.add("ps2map__base-hexes");
    }

    setBaseOwner(baseId: number, factionId: number): void {
        const svg = this.element.firstElementChild as SVGElement | null;
        if (svg == null)
            throw "Unable to find HexLayer SVG element";
        const polygon = svg.querySelector(`polygon[id="${baseId}"]`) as SVGPolygonElement | null;
        if (polygon == null)
            throw `Unable to find base polygon with id ${baseId}`;

        const colours: any = {
            "0": "rgba(0, 0, 0, 1.0)",
            "1": "rgba(160, 77, 183, 1.0)",
            "2": "rgba(81, 123, 204, 1.0)",
            "3": "rgba(226, 25, 25, 1.0)",
            "4": "rgba(255, 255, 255, 1.0)",
        }
        polygon.style.fill = colours[factionId.toFixed()];
    }

    // TODO: Make private
    applyPolygonHoverFix(svg: SVGElement): void {
        svg.querySelectorAll("polygon").forEach((polygon) => {
            // Event handler for applying hover effects
            const addHoverFx = () => {
                // This moves the existing polygon to the top of the SVG to
                // make sure the hover effect does not get overshadowed by
                // neighbouring polygons.
                svg.appendChild(polygon);
                // Event handler for removing hover effects
                const removeHoverFx = () => polygon.style.removeProperty("stroke");
                polygon.addEventListener("mouseleave", removeHoverFx, {
                    passive: true
                });
                polygon.addEventListener("touchend", removeHoverFx, {
                    passive: true
                });
                polygon.addEventListener("touchcancel", removeHoverFx, {
                    passive: true
                });
                // Dispatch polygon hover callbacks
                let i = this.polygonHoverCallbacks.length;
                while (i-- > 0)
                    this.polygonHoverCallbacks[i](parseInt(polygon.id), polygon);
                // Apply hover
                polygon.style.stroke = "#ffffff";
            };
            polygon.addEventListener("mouseenter", addHoverFx, {
                passive: true
            });
            polygon.addEventListener("touchstart", addHoverFx, {
                passive: true
            });
        });
    }

    protected deferredLayerUpdate(viewbox: Box, zoom: number): void {
        const svg = this.element.firstElementChild as SVGElement | null;
        if (svg != null) {
            const strokeWith = 10 / 1.5 ** zoom;
            svg.style.setProperty(
                "--ps2map__base-hexes__stroke-width", `${strokeWith}px`);
        }
    }
}