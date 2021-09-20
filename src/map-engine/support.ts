namespace Utils {

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