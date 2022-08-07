class MapRenderer {

    private readonly _camera: Camera;
    private _layers: LayerManager;

    constructor(camera: Camera, layers: LayerManager) {
        this._camera = camera;
        this._layers = layers;
    }

    /**
     * Redraw parts of the map in a browser-friendly manner.
     *
     * @remarks
     * If `layers` is not provided, all layers will be redrawn. If `layers` is
     * set to a (list of) map layer instance(s), only these layers will be
     * redrawn.
     *
     * @param layers Layers to redraw. If not provided, all layers are redrawn.
     */
    public redraw(layers: MapLayer | MapLayer[] | undefined = undefined): void {
        let layersToRedraw: Readonly<MapLayer[]> = [];
        if (layers === undefined)
            layersToRedraw = this._layers.allLayers();
        else if ((layers as MapLayer[]).length !== undefined)
            layersToRedraw = (layers as MapLayer[]);
        else
            layersToRedraw = [(layers as MapLayer)];
        // Redraw layers
        const viewBox = this._camera.viewBox();
        const zoom = this._camera.zoom();
        layersToRedraw.forEach(layer => {
            layer.redraw(viewBox, zoom);
            layer.setRedrawArgs(viewBox, zoom);
        });
    }

    /** Update the layer manager used for redrawing all layers. */
    public updateLayerManager(layers: LayerManager): void {
        this._layers = layers;
    }
}


/**
 * Decorator for debouncing animation frame request handlers.
 *
 * The decorated function will be scheduled for the next animation frame.
 * Re-calling this function prior to this animation frame's firing will cancel
 * the existing animation frame request and schedule a new one with updated
 * arguments.
 * @param target The callback to run as part of the animation frame
 */
function rafDebounce<T extends (...args: never) => void>(target: T): T {
    let isScheduled: boolean = false;
    let handle: number = 0;

    function wrapper(...args: never): void {
        if (isScheduled)
            cancelAnimationFrame(handle);
        handle = requestAnimationFrame(() => {
            target.apply(wrapper, args);
            isScheduled = false;
        });
        isScheduled = true;
    }
    return wrapper as T;
}
