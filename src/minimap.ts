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
    private mapSize: number;

    /** CSS size of the minimap. */
    private readonly cssSize: number;

    /** Callbacks invoked when the the user clicks on the minimap. */
    jumpToCallbacks: ((arg0: Point) => void)[] = []

    constructor(element: HTMLDivElement, mapSize: number, background: string) {
        this.mapSize = mapSize;
        // Set up DOM containers
        this.element = element;
        this.cssSize = this.element.clientWidth;
        this.element.style.height = `${this.cssSize}px`;
        this.viewboxElement = document.createElement("div");
        this.element.appendChild(this.viewboxElement);

        // Set background image
        this.element.style.backgroundImage = `url(${background})`;
        this.element.style.backgroundSize = `100%`;

        // Attach event listeners
        this.element.addEventListener("mousedown", this.jumpToPosition.bind(this), {
            passive: true
        });
    }

    /**
     * Update the minimap with a new map size and background texture.
     * @param mapSize New map size to use
     * @param background Updated background texture for the new map
     */
    configureMinimap(mapSize: number, background: string): void {
        this.mapSize = mapSize;
        this.element.style.backgroundImage = `url(${background})`;
    }

    /**
     * Event callback for clicking on the minimap.
     * @param evt Position the mouse was clicked at
     */
    private jumpToPosition(evtDown: MouseEvent): void {
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
            let i = this.jumpToCallbacks.length;
            while (i-- > 0)
                this.jumpToCallbacks[i](target);
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
}