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
    public setContinent(continentId: number): void {
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        // Get the base outline SVGs for this continent
        fetch(this.getBaseHexes(continentId)).then((data) => {
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
     * Retrieve the base outline SVG for the given continent.
     *
     * Note that the returned SVG element will have a view box size of
     * 8192 x 8192 px.
     * @param continentId The ID of the continent.
     * @returns Image path to the base outline SVG.
     */
    private getBaseHexes(continentId: number): string {
        let fileName = "indar";
        switch (continentId) {
            case 4:
                fileName = "hossin";
                break;
            case 6:
                fileName = "amerish";
                break;
            case 8:
                fileName = "esamir";
                break;
        }
        return `http://127.0.0.1:5000/static/hex/${fileName}.svg`;
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
