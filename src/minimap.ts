/// <reference path="api/index.ts" />
/// <reference path="map-engine/types.ts" />

/**
 * Details for the "ps2map_minimapjump" custom event.
  */
interface MinimapJumpEvent {
    target: Point,
}

/**
 * Controller for on-screen minimap.
 */
class Minimap {
    /**
     * DOM element containing the minimap.
     * Its height will be set equal to its width.
     */
    readonly element: HTMLDivElement;
    /** Minimap view box frame element. */
    private readonly viewBoxElement: HTMLDivElement;

    /** Size of the map used. Controls view box interpretation. */
    private mapSize: number = 0;
    private baseOutlineSvg: SVGElement | undefined = undefined;

    /** CSS size of the minimap. */
    private readonly cssSize: number;

    private minimapHexAlpha: number = 0.5;
    private polygons: Map<number, SVGPolygonElement> = new Map();

    constructor(element: HTMLDivElement, continent: Api.Continent | undefined = undefined) {
        // Set up DOM containers
        this.element = element;
        this.element.classList.add("ps2map__minimap");
        this.cssSize = this.element.clientWidth;
        this.element.style.height = `${this.cssSize}px`;
        this.viewBoxElement = document.createElement("div");
        this.viewBoxElement.classList.add("ps2map__minimap__viewbox");
        this.element.appendChild(this.viewBoxElement);

        // If a continent is provided, set up the minimap
        if (continent != undefined)
            this.setContinent(continent);

        // Attach event listener
        this.element.addEventListener("mousedown", this.jumpToPosition.bind(this), {
            passive: true
        });
    }

    /**
     * Event callback for clicking on the minimap.
     * @param evtDown Position the mouse was clicked at
     */
    private jumpToPosition(evtDown: MouseEvent): void {
        if (this.mapSize == 0)
            return;
        // Continuous "mousemove" callback
        const drag = Utils.rafDebounce((evtDrag: MouseEvent) => {
            // Get relative cursor position
            const rect = this.element.getBoundingClientRect();
            const relX = (evtDrag.clientX - rect.left) / (rect.width);
            const relY = (evtDrag.clientY - rect.top) / (rect.height);
            // Calculate target cursor position
            const target: Point = {
                x: Math.round(relX * this.mapSize),
                y: Math.round((1 - relY) * this.mapSize)
            };
            this.element.dispatchEvent(this.buildMinimapJumpEvent(target));
        });
        // Global "mouseup" callback
        const up = () => {
            this.element.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };
        // Add listeners
        document.addEventListener("mouseup", up);
        this.element.addEventListener("mousemove", drag, {
            passive: true
        });
        // Manually invoke the "drag" callback once to handle single click pans
        drag(evtDown);
    }

    /** Update the viewBox displayed on the minimap. */
    setViewBox(viewBox: Box): void {
        const mapSize = this.mapSize;
        // Convert map-coordinate viewBox to percentages
        const relViewBox: Box = {
            top: (viewBox.top + mapSize * 0.5) / mapSize,
            left: (viewBox.left + mapSize * 0.5) / mapSize,
            bottom: (viewBox.bottom + mapSize * 0.5) / mapSize,
            right: (viewBox.right + mapSize * 0.5) / mapSize
        };
        const relHeight = relViewBox.top - relViewBox.bottom;
        const relWidth = relViewBox.right - relViewBox.left;
        const relLeft = relViewBox.left - 0.5;
        const relTop = relViewBox.bottom - 0.5;
        // Project the relative percentages onto the minimap
        this.viewBoxElement.style.height = `${this.cssSize * relHeight}px`;
        this.viewBoxElement.style.width = `${this.cssSize * relWidth}px`;
        this.viewBoxElement.style.left = `${this.cssSize * relLeft}px`;
        this.viewBoxElement.style.bottom = `${this.cssSize * relTop}px`;
    }

    setBaseOwnership(baseId: number, factionId: number): void {
        // TODO: Read faction colours from CSS variables/user config
        const colours: any = {
            0: `rgba(0, 0, 0, ${this.minimapHexAlpha})`,
            1: `rgba(160, 77, 183, ${this.minimapHexAlpha})`,
            2: `rgba(81, 123, 204, ${this.minimapHexAlpha})`,
            3: `rgba(226, 25, 25, ${this.minimapHexAlpha})`,
            4: `rgba(255, 255, 255, ${this.minimapHexAlpha})`,
        }

        const polygon = this.polygons.get(baseId);
        if (polygon)
            polygon.style.fill = colours[factionId];
    }

    setContinent(continent: Api.Continent): void {
        this.mapSize = continent.map_size;
        // Set minimap background image
        this.element.style.backgroundImage =
            `url(${Api.getMinimapImagePath(continent.code)})`;
        // Create base outlines
        Api.getContinentOutlinesSvg(continent)
            .then((svg) => {
                // Delete the existing hex layer, if any
                if (this.baseOutlineSvg != undefined)
                    this.element.removeChild(this.baseOutlineSvg);
                // Delete any existing polygons
                this.polygons = new Map();
                // Add the new hex layer
                svg.classList.add("ps2map__minimap__hexes");
                this.baseOutlineSvg = svg;
                this.element.appendChild(this.baseOutlineSvg);
                // Add the polygons to the local cache
                const polygons = svg.querySelectorAll("polygon");
                let i = polygons.length;
                while (i-- > 0) {
                    this.polygons.set(parseInt(polygons[i].id), polygons[i]);
                    // Update polygon IDs to be unique
                    polygons[i].id = this.polygonIdFromBaseId(polygons[i].id);
                }
            });
    }

    private buildMinimapJumpEvent(target: Point): CustomEvent<MinimapJumpEvent> {
        return new CustomEvent("ps2map_minimapjump", {
            detail: {
                target: target
            },
            bubbles: true,
            cancelable: true,
        });
    }

    private polygonIdFromBaseId(baseId: number | string): string {
        return `minimap-baseId-${baseId}`
    }
}