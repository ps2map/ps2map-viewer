/// <reference path="api/index.ts" />
/// <reference path="map-engine/types.ts" />

/**
 * Controller for on-screen minimap.
 */
class Minimap {
    /**
     * DOM element containing the minimap.
     * Its height will be set equal to its width.
     */
    readonly element: HTMLDivElement;
    /** Minimap viewbox frame element. */
    private readonly viewboxElement: HTMLDivElement;

    /** Size of the map used. Controls viewbox interpretation. */
    private mapSize: number = 0;
    private baseOutlineSvg: SVGElement | undefined = undefined;

    /** CSS size of the minimap. */
    private readonly cssSize: number;

    /** Callbacks invoked when the the user clicks on the minimap. */
    onJumpTo: ((arg0: Point) => void)[] = []

    private minimapHexAlpha: number = 0.5;
    private polygons: Map<number, SVGPolygonElement> = new Map();

    constructor(element: HTMLDivElement, continent: Api.Continent | undefined = undefined) {
        // Set up DOM containers
        this.element = element;
        this.element.classList.add("ps2map__minimap");
        this.cssSize = this.element.clientWidth;
        this.element.style.height = `${this.cssSize}px`;
        this.viewboxElement = document.createElement("div");
        this.viewboxElement.classList.add("ps2map__minimap__viewbox");
        this.element.appendChild(this.viewboxElement);

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
     * @param evt Position the mouse was clicked at
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
            // Invoke jumpTo callbacks
            let i = this.onJumpTo.length;
            while (i-- > 0)
                this.onJumpTo[i](target);
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

    /** Update the viewbox displayed on the minimap. */
    setViewbox(viewbox: Box): void {
        const mapSize = this.mapSize;
        // Convert map-coordinate viewbox to percentages
        const relViewbox: Box = {
            top: (viewbox.top + mapSize * 0.5) / mapSize,
            left: (viewbox.left + mapSize * 0.5) / mapSize,
            bottom: (viewbox.bottom + mapSize * 0.5) / mapSize,
            right: (viewbox.right + mapSize * 0.5) / mapSize
        };
        const relHeight = relViewbox.top - relViewbox.bottom;
        const relWidth = relViewbox.right - relViewbox.left;
        const relLeft = relViewbox.left - 0.5;
        const relTop = relViewbox.bottom - 0.5;
        // Project the relative percentages onto the minimap
        this.viewboxElement.style.height = `${this.cssSize * relHeight}px`;
        this.viewboxElement.style.width = `${this.cssSize * relWidth}px`;
        this.viewboxElement.style.left = `${this.cssSize * relLeft}px`;
        this.viewboxElement.style.bottom = `${this.cssSize * relTop}px`;
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
                while (i-- > 0)
                    this.polygons.set(parseInt(polygons[i].id), polygons[i]);
            });
    }

}