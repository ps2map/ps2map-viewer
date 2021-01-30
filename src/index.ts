/// <reference path='./amerish_svgs.ts' />


/**
 * Show or hide a map layer based on the state of a checkbox.
 *
 * The layer will be switched between the display types `block` and `none`.
 *
 * This function is a callback factory and will return a closure with the
 * despired properties that can be hooked onto the checkbox's `'click'` event.
 *
 * @param checkbox Checkbox controlling the map layer's visibility
 * @param layer Map layer to show or hide
 */
function toggleMapLayer(checkbox: HTMLInputElement, layer: HTMLDivElement): () => void {
    return function (): void {
        layer.style.display = checkbox.checked ? "block" : "none";
    }
}


// Lazy event listener association
window.addEventListener('load', function (): void {
    let map = <HTMLDivElement>document.getElementById('map');
    map.addEventListener('mousedown', panMap);
    map.addEventListener('wheel', zoomMap);

    // Hook up map layer controls
    let textureBtn = <HTMLInputElement>document.getElementById('showMapTexture');
    let textureLayer = <HTMLDivElement>document.getElementById('mapTextureLayer');
    textureBtn.addEventListener('click', toggleMapLayer(textureBtn, textureLayer));
    let hexesBtn = <HTMLInputElement>document.getElementById('showHexes');
    let hexesLayer = <HTMLDivElement>document.getElementById('mapHexLayer');
    hexesBtn.addEventListener('click', toggleMapLayer(hexesBtn, hexesLayer));

    // Load individual base SVGs
    hexesLayer.innerHTML = svg_strings;
});


// Map pan controls
function panMap(this: HTMLDivElement, pushEvent: MouseEvent): void {
    let map = <HTMLDivElement>document.getElementById('map');
    let initialOffsetLeft = this.offsetLeft;
    let initialOffsetTop = this.offsetTop;
    const sizeX = this.clientWidth;
    const sizeY = this.clientHeight;

    function mapMover(this: HTMLDivElement, moveEvent: MouseEvent): void {
        let deltaX = moveEvent.clientX - pushEvent.clientX;
        let deltaY = moveEvent.clientY - pushEvent.clientY;
        let newLeft = initialOffsetLeft + deltaX;
        let newTop = initialOffsetTop + deltaY;
        // Constraint motion so half of the map is still in frame
        if (-sizeX < newLeft && newLeft < 0) {
            this.style.left = `${newLeft}px`;
        }
        if (-sizeY < newTop && newTop < 0) {
            this.style.top = `${newTop}px`;
        }
    }
    map.addEventListener('mousemove', mapMover);

    // This ensures mouseup works throughout the entire document
    document.addEventListener('mouseup', function (): void {
        map.removeEventListener('mousemove', mapMover);
    });
}

let zoomLevel = 1.0;

// Map zoom controls
function zoomMap(this: HTMLDivElement, wheelEvent: WheelEvent): void {
    wheelEvent.preventDefault()
    zoomLevel = wheelEvent.deltaY < 0 ? zoomLevel * 1.2 : zoomLevel * 0.8;
    // Limit zoom level
    if (zoomLevel < 0.1) {
        zoomLevel = 0.1;
    }
    else if (zoomLevel > 2.0) {
        zoomLevel = 2.0;
    }
    // Resize map
    this.style.transform = `scale(${zoomLevel})`;
}