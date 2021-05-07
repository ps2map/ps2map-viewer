/**
 * Hex-tile map layer.
 *
 * This defines the logic required to draw and update the base outlines
 * for a given continent.
 */

/// <reference path="./base.ts" />

/**
 * MapLayer subclass used to draw base outlines on the map.
 */
class HexLayer extends MapLayer {
    public baseHoverCallback: (arg0: number) => void = () => null;

    constructor(layer: HTMLDivElement, initialContinentId: number) {
        super(layer, initialContinentId);
    }

    /**
     * Switch the currently active continent.
     * @param continentId ID of the new continent to display.
     */
    public switchContinent(continentId: number): void {
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        // Get the base outline SVGs for this continent
        getContinent(continentId)
            .then((continent) => {
                return fetch(
                    `http://127.0.0.1:5000/static/hex/${continent.code}.svg`
                );
            })
            .then((data) => {
                this.clear();
                data.text().then((payload) => {
                    const factory = document.createElement("template");
                    factory.innerHTML = payload.trim();
                    const svg = factory.content.firstElementChild;
                    if (svg == null) {
                        return;
                    }
                    svg.classList.add("layer-hexes__hex");
                    svg.querySelectorAll("polygon").forEach((poly) => {
                        const promoteElement = () => {
                            svg.appendChild(poly);
                        };
                        poly.addEventListener("mouseenter", promoteElement, {
                            passive: true,
                        });
                        poly.addEventListener("touchstart", promoteElement, {
                            passive: true,
                        });
                    });
                    this.layer.appendChild(svg);
                });
            });
    }

    /**
     * Helper function for triggering mouseover event listeners.
     *
     * A mouseover event on the given element will run the callback
     * defined in the HexLayer.baseHoverCallback property.
     * @param element The SVG element to attach a listener to.
     */
    private registerHoverCallback(element: SVGElement): void {
        element.addEventListener("mouseover", (evt) => {
            // Only call hover callbacks if no mouse button is pressed
            if (evt.buttons % 4 > 0) {
                return;
            }
            this.baseHoverCallback(parseInt(element.id));
        });
    }
}
