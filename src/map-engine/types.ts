/** Type hint for 2D points. */
type Point = {
    readonly x: number;
    readonly y: number;
};

/** Type hint for axis-aligned bounding boxes. */
type Box = {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
};