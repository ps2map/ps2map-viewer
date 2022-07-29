/**
 * Class interface for layers supporting base ownership updates.
 */
abstract class SupportsBaseOwnership {

    abstract updateBaseOwnership(baseOwnershipMap: Map<number, number>): void;
};
