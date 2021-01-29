/**
 * Show or hide a map layer based on the state of a checkbox.
 * 
 * The layer will be switched between the display types `block` and `none`.
 *
 * This function is a callback factory and will return a closure with the
 * despired properties that can be hooked onto the checkbox's `'click'` event.
 * 
 * @param {checkbox} checkbox Checkbox controlling the map layer's visibility
 * @param {container} layer Map layer to show or hide
 */
function toggleMapLayer(checkbox, layer) {
    return function () {
        layer.style.display = checkbox.checked ? "block" : "none";
    }
}


// Lazy event listener association
window.addEventListener('load', function () {
    let map = document.getElementById('map');
    map.addEventListener('mousedown', panMap);
    map.addEventListener('wheel', zoomMap);

    // Hook up map layer controls
    let TextureBtn = document.getElementById('showMapTexture');
    let TextureLayer = document.getElementById('mapTextureLayer');
    TextureBtn.addEventListener('click', toggleMapLayer(TextureBtn, TextureLayer));
    let HexesBtn = document.getElementById('showHexes');
    let HexesLayer = document.getElementById('mapHexLayer');
    HexesBtn.addEventListener('click', toggleMapLayer(HexesBtn, HexesLayer));
});


// Map pan controls
function panMap(pushEvent) {
    let initialOffsetLeft = this.offsetLeft;
    let initialOffsetTop = this.offsetTop;
    const sizeX = this.clientWidth;
    const sizeY = this.clientHeight;

    function mapMover(moveEvent) {
        let deltaX = moveEvent.clientX - pushEvent.clientX;
        let deltaY = moveEvent.clientY - pushEvent.clientY;
        let newLeft = initialOffsetLeft + deltaX;
        let newTop = initialOffsetTop + deltaY;
        // Constraint motion so half of the map is still in frame
        if (-sizeX < newLeft && newLeft < 0) {
            this.style.left = newLeft + 'px';
        }
        if (-sizeY < newTop && newTop < 0) {
            this.style.top = newTop + 'px';
        }
    }
    map.addEventListener('mousemove', mapMover);

    // This ensures mouseup works throughout the entire document
    document.addEventListener('mouseup', function () {
        map.removeEventListener('mousemove', mapMover);
    });
}

let zoomLevel = 1.0;

// Map zoom controls
function zoomMap(wheelEvent) {
    wheelEvent.preventDefault()
    zoomLevel = wheelEvent.deltaY < 0 ? zoomLevel * 1.2 : zoomLevel * 0.8;
    console.log(zoomLevel);
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