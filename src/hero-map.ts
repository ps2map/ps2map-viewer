/// <reference path="./map-engine/map-renderer.ts" />
/// <reference path="./api/getters.ts" />

/**
 * Custom map controller for primary PlanetSide 2 continent map.
 * 
 * This also includes a mini-map because reasons.
 */
class HeroMap {
    /** Current continent ID */
    private continentId: number;
    /** Internal map renderer wrapped by this class. */
    private controller: MapRenderer;

    constructor(
        viewport: HTMLDivElement,
        initialContinentId: number,
        endpoint: string
    ) {
        this.continentId = initialContinentId;

        // TODO: Query the API to determine the appropriate map size for the
        // given continent
        const mapSize = 8192;

        // Initialise map controller
        this.controller = new MapRenderer(viewport, mapSize);

        // Add map layer for base hexes
        const hexLayer = new StaticLayer("hexes", mapSize);
        hexLayer.element.classList.add("ps2map__base-hexes");
        // Load continent data
        Api.getContinent(this.continentId)
            // Fetch map outlines
            .then((continent) => {
                return fetch(`${endpoint}/static/hex/${continent.code}.svg`);
            })
            .then((data) => {
                return data.text();
            })
            // Create a template DOM element to throw the SVG into
            .then((payload) => {
                const factory = document.createElement("template");
                factory.innerHTML = payload.trim();
                // Extract the inner SVG from the template
                const svg = factory.content.firstElementChild;
                if (svg == null) {
                    throw "Unable to load map hexes";
                }
                // Setup SVG element
                svg.classList.add("ps2map__base-hexes__hex");
                // Update polygon order to ensure active hexes are drawn in
                // front of inactive ones
                svg.querySelectorAll("polygon").forEach((polygon) => {
                    const promoteElement = () => {
                        svg.appendChild(polygon);
                        // Workaround for broken :hover pseudoclass redraw.
                        // See repo issue #1 for details.
                        const removeHover = () => {
                            polygon.removeAttribute("style");
                        };
                        polygon.addEventListener("mouseleave", removeHover, {
                            passive: true,
                        });
                        polygon.addEventListener("touchend", removeHover, {
                            passive: true,
                        });
                        polygon.addEventListener("touchcancel", removeHover, {
                            passive: true,
                        });
                        polygon.style.stroke = "#ffffff";
                    };
                    polygon.addEventListener("mouseenter", promoteElement, {
                        passive: true,
                    });
                    polygon.addEventListener("touchstart", promoteElement, {
                        passive: true,
                    });
                });
                hexLayer.addChild(svg);
            });
        this.controller.addLayer(hexLayer);
    }
}