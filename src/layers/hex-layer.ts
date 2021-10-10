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

    svgFactory(data: string): SVGElement {
        const factory = document.createElement("template");
        factory.innerHTML = data;
        // Extract the SVG node
        const svg = factory.content.firstElementChild;
        if (!(svg instanceof SVGElement))
            throw "Unable to load contents from map hex SVG";
        // Setup SVG element
        svg.classList.add("ps2map__base-hexes__svg");
        // Apply polygon hover fix to ensure hovered outlines are drawn on top
        this.applyPolygonHoverFix(svg);
        return svg;
    }

    private applyPolygonHoverFix(svg: SVGElement): void {
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