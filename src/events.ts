/// <reference path="./api/index.ts" />

namespace Events {

    /**
     * Details for the "ps2map_continentchange" custom event.
     */
    export interface ContinentChanged {
        continent: Api.Continent;
    }

    export function continentChangedFactory(
        continent: Api.Continent
    ): CustomEvent<ContinentChanged> {
        return new CustomEvent("ps2map_continentchanged", {
            detail: {
                continent: continent
            },
            bubbles: true,
            cancelable: true,
        });
    }

    /**
     * Details for the "ps2map_baseownershipchanged" custom event.
     */
    export interface BaseOwnershipChanged {
        ownership: Map<number, number>;
    }

    export function baseOwnershipChangedFactory(
        ownership: Map<number, number>
    ): CustomEvent<BaseOwnershipChanged> {
        return new CustomEvent("ps2map_baseownershipchanged", {
            detail: {
                ownership: ownership
            },
            bubbles: true,
            cancelable: true,
        });
    }

}
