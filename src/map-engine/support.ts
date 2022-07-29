namespace Utils {

    /**
     * Clamp the given value within the two bounds
     * @param value Value to clamp
     * @param min Minimum return value
     * @param max Maximum return value
     * @returns Clamped value
     */
    export function clamp(value: number, min: number, max: number): number {
        if (max <= min) return min;
        if (value < min) return min;
        if (value > max) return max;
        return value;
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
    export function rafDebounce<T extends (...args: any) => void>(target: T): T {
        let isScheduled: boolean = false;
        let handle: number = 0;

        function wrapper(...args: any): void {
            if (isScheduled)
                cancelAnimationFrame(handle);
            handle = requestAnimationFrame(() => {
                target.apply(wrapper, args);
                isScheduled = false;
            });
            isScheduled = true;
        }
        return wrapper as any;
    }

    /**
     * Return whether the two rectangles overlap.
     * @param a First rectangle
     * @param b Second rewctangle
     * @returns true if the rectangles have a non-zero overlap, otherwise false
     */
    export function rectanglesIntersect(a: ViewBox, b: ViewBox): boolean {
        return (a.left < b.right
            && a.right > b.left
            && a.top > b.bottom
            && a.bottom < b.top);
    }
}
