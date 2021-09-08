/// <reference path="./map-engine/index.ts" />
/// <reference path="./api/getters.ts" />


class HeroMap {
    private continentId: number;
    private controller: MapController;

    constructor(viewport: HTMLDivElement, initialContinentId: number, endpoint: string) {
        this.continentId = initialContinentId;

        // TODO: Query the API to determine the appropriate map size for the
        // given continent
        const mapSize = 8192;

        // Initialise map controller
        this.controller = new MapController(viewport, mapSize);

        // Hex layer
        const hexLayer = new StaticLayer("hexes", mapSize);
        hexLayer.layer.classList.add("ps2map__base-hexes");
        Api.getContinent(this.continentId).then((continent) => {
            return fetch(`${endpoint}/static/hex/${continent.code}.svg`);
        }).then((data) => {
            return data.text();
        }).then(
            (payload) => {
                const factory = document.createElement("template");
                factory.innerHTML = payload.trim();
                const svg = factory.content.firstElementChild;
                if (svg == null) {
                    throw "Unable to load map hexes";
                }
                svg.classList.add("ps2map__base-hexes__hex");
                svg.querySelectorAll("polygon").forEach((polygon) => {
                    const promoteElement = () => {
                        svg.appendChild(polygon);
                        // Firefox-specific workaround for weird broken :hover
                        // pseudoclass. See repo issue #1 for details.
                        if (navigator.userAgent.toLowerCase().indexOf("firefox") == -1) {
                            return; // Non-Firefox browsers exit here
                        }
                        // Firefox-specific hacks
                        const removeHover = () => {
                            polygon.removeAttribute("style");
                        };
                        polygon.addEventListener("mouseleave", removeHover, {
                            passive: true
                        });
                        polygon.addEventListener("touchend", removeHover, {
                            passive: true
                        });
                        polygon.addEventListener("touchcancel", removeHover, {
                            passive: true
                        });
                        polygon.style.stroke = '#ffffff';
                    };
                    polygon.addEventListener("mouseenter", promoteElement, {
                        passive: true
                    });
                    polygon.addEventListener("touchstart", promoteElement, {
                        passive: true
                    });
                });
                hexLayer.addChild(svg);
            }
        )
        this.controller.addLayer(hexLayer);
    }
}
