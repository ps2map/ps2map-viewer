/**
 * Base class for all tools.
 * 
 * Additionally serves as the tool instance used when no tool is active. Its
 * "id" and "displayName" field are therefore valid.
 */
class Tool {

    static readonly id: string = "none";
    static readonly displayName: string = "None";
    static readonly defaultState: object = {};

    private readonly _map: HeroMap;
    protected readonly _viewport: HTMLDivElement;
    protected readonly _tool_panel: HTMLDivElement;

    constructor(viewport: HTMLDivElement, map: HeroMap, tool_panel: HTMLDivElement) {
        this._map = map;
        this._viewport = viewport;
        this._tool_panel = tool_panel;

        this._setUpToolPanel();
    }

    /**
     * Clean-up method called when the tool is deactivated.
     * 
     * Consider this a "destructor" for the tool that must be called to ensure
     * that the tool is properly deactivated without leaving any orphaned GUI
     * elements or event listeners in the DOM.
     */
    public tearDown(): void {
        this._tool_panel.innerHTML = "";
        this._tool_panel.removeAttribute("style");
    }

    /**
     * Helper method to get the clicked map coordinates from a mouse event.
     * @param event The mouse event.
     * @returns The clicked map coordinates.
     */
    protected _getMapPosition(event: MouseEvent): Point {
        // Get relative click position within the viewport
        const relX = (event.clientX - this._viewport.offsetLeft) / this._viewport.clientWidth;
        const relY = 1 - (event.clientY - this._viewport.offsetTop) / this._viewport.clientHeight;
        // Calculate corresponding map position
        const viewBox = this._map.renderer.getViewBox();
        const halfSize = this._map.renderer.getMapSize() * 0.5;
        return {
            x: -halfSize + viewBox.left + (viewBox.right - viewBox.left) * relX,
            y: -halfSize + viewBox.bottom + (viewBox.top - viewBox.bottom) * relY,
        };
    }

    /**
     * Populate the tool panel with tool-specific user interface elements.
     * 
     * This is called automatically when the tool is created. The default
     * implementation does nothing, but subclasses may override this to add
     * their own elements.
     */
    protected _setUpToolPanel(): void { }
}