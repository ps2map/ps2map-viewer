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
        baseId: number;
        factionId: number;
    }

    export function baseOwnershipChangedFactory(
        baseId: number,
        factionId: number
    ): CustomEvent<BaseOwnershipChanged> {
        return new CustomEvent("ps2map_baseownershipchanged", {
            detail: {
                baseId: baseId,
                factionId: factionId
            },
            bubbles: true,
            cancelable: true,
        });
    }

}
