/**
 * Getter methods for API access.
 *
 * These functions generate the URLs used to talk to the API and return
 * the appropriate payloads. Payloads are provided for reference only
 * and are not enforced or validated.
 */

/// <reference path="./payloads.ts" />

namespace Api {

    // API endpoint to access
    const restEndpoint = "http://127.0.0.1:5000/";

    /**
     * Return an array of BaseInfo payloads for the given continent.
     * @param continentId ID of the continent for which to retrieve bases.
     * Will be rounded to an integer as part of the URL generation.
     */
    export function getBasesFromContinent(continentId: number): Promise < Array < Api.BaseInfo >> {
        const rounded = Math.round(continentId);
        const url = `${restEndpoint}bases/info?continent_id=${rounded}`;
        return fetch(url).then((value) => {
            return value.json() as unknown as Array < Api.BaseInfo > ;
        });
    }

    /**
     * Return the ContinentInfo payload for the given continent.
     * @param continentId ID of the continent to retrieve. Will be rounded
     * to an integer as part of the URL generation.
     * @throws If give continentId does not match any known continent.
     */
    export function getContinent(
        continentId: number
    ): Promise < Api.ContinentInfo > {
        const url = `${restEndpoint}continents/info`;
        return fetch(url)
            .then((value) => {
                return value.json() as unknown as Array < Api.ContinentInfo > ;
            })
            .then((contList) => {
                for (let i = 0; i < contList.length; i++) {
                    const cont = contList[i];
                    if (cont.id == continentId) return cont;
                }
                throw `unknown continent ID: ${continentId}`;
            });
    }
}