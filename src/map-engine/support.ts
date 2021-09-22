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
    export function rafDebounce(target: any): () => void {
        let isScheduled: boolean = false;
        let handle: number = 0;

        function wrapper() {
            if (isScheduled)
                cancelAnimationFrame(handle);
            const args = arguments;
            handle = requestAnimationFrame(() => {
                target.apply(wrapper, args);
                isScheduled = false;
            });
            isScheduled = true;
        }
        return wrapper;
    }

    /**
     * Remap a value from the source range to the target range.
     * @param value Value to remap
     * @param sourceLower Lower limit of source range
     * @param sourceUpper Upper limit of source range
     * @param targetLower Lower limit of target range
     * @param targetUpper Upper limit of target range
     * @returns `value` rescaled to the target range
     */
    export function remap(
        value: number,
        sourceLower: number,
        sourceUpper: number,
        targetLower: number,
        targetUpper: number
    ): number {
        const sourceSpan = sourceUpper - sourceLower;
        const targetSpan = targetUpper - targetLower;
        if (sourceSpan == 0) return targetLower;
        const relValue = value - sourceLower / sourceSpan;
        return targetLower + relValue * targetSpan;
    }

    /**
     * Round the given value to `decimals` decimal places
     * @param value Value to round
     * @param decimals Number of decimal places
     * @returns `value` rounded to `decimals` decimal places
     */
    export function roundTo(value: number, decimals: number): number {
        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor
    }
}