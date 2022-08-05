/**
 * Abstract base class for layers that respond to base ownership updates.
 *
 * This is primarily used as a type hinting mechanism, the actual test is done
 * by checking for the presence of a updateBaseOwnership() method at runtime.
 */
abstract class SupportsBaseOwnership {
    /**
     * Callback invoked when the current continent's base ownership changes.
     *
     * @param ownershipMap - A map of base IDs to their owning faction ID.
     */
    public abstract updateBaseOwnership(ownershipMap: Map<number, number>): void;
}
