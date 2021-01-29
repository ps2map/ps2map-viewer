window.addEventListener('load', attachEventListeners);

function attachEventListeners() {
    let map = document.getElementById('map');
    map.addEventListener('mousedown', panMap);
}


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
    document.addEventListener('mouseup', function (releaseEvent) {
        map.removeEventListener('mousemove', mapMover);
    });
}
