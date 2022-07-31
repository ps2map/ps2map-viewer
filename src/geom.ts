interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

function _getPolyLineBboxes(line: Point[]): BBox[] {
    const bboxes: BBox[] = [];
    for (let i = 0; i < line.length - 1; i++) {
        const p1 = line[i];
        const p2 = line[i + 1];
        if (p1 && p2) {
            const bbox = {
                minX: Math.min(p1.x, p2.x),
                minY: Math.min(p1.y, p2.y),
                maxX: Math.max(p1.x, p2.x),
                maxY: Math.max(p1.y, p2.y),
            };
            bboxes.push(bbox);
        }
    }
    return bboxes
}

function _boundingBoxIntersect(a: BBox, b: BBox): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function _lineIntersect(a: Point[], b: Point[]): boolean {
    const a0 = a[0];
    const a1 = a[1];
    const b0 = b[0];
    const b1 = b[1];
    if (!a0 || !a1 || !b0 || !b1)
        return false;
    const det = (a1.x - a0.x) * (b1.y - b0.y) - (a1.y - a0.y) * (b1.x - b0.x);
    if (det === 0)
        return false;
    const projA = (
        (b1.y - b0.y) * (b1.x - a0.x) + (b0.x - b1.x) * (b1.y - a0.y)) / det;
    const projB = (
        (a0.y - a1.y) * (b1.x - a0.x) + (a1.x - a0.x) * (b1.y - a0.y)) / det;
    return projA >= 0 && projA <= 1 && projB >= 0 && projB <= 1;
}

function polyLineStrokeErase(polylines: Point[][], stroke: Point[]): Point[][] {
    // Calculate the bounding boxes for each eraser stroke
    const eraserBboxes = _getPolyLineBboxes(stroke);
    // For each polyline, calculate the bounding boxes for each line segment
    // and check if the bounding boxes overlap. If they do, remove the line
    // segment.
    const remaining: Point[][] = [];
    polylines.forEach(polyline => {
        let deleted = false;
        for (let i = 0; i < polyline.length - 1; i++) {
            const p1 = polyline[i];
            const p2 = polyline[i + 1];
            if (p1 && p2) {
                const bbox = {
                    minX: Math.min(p1.x, p2.x),
                    minY: Math.min(p1.y, p2.y),
                    maxX: Math.max(p1.x, p2.x),
                    maxY: Math.max(p1.y, p2.y),
                };
                // If any of the bounding boxes overlap, remove the line segment
                eraserBboxes.forEach((eraserBbox, i) => {
                    if (_boundingBoxIntersect(bbox, eraserBbox)
                        && _lineIntersect([stroke[i]!, stroke[i + 1]!], [p1, p2]))
                        deleted = true;
                });
            }
            if (deleted)
                break
        }
        if (!deleted) {
            remaining.push(polyline);
        }
    });
    return remaining;
}
