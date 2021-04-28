/**
 * Getter methods for API access.
 *
 * These functions generate the URLs used to talk to the API and return
 * the appropriate payloads. Payloads are provided for reference only
 * and are not enforced or validated.
 */

/// <reference path="./payloads.ts" />

// API endpoint to access
const restEndpoint = "http://127.0.0.1:5000/";

/**
 * Return an array of BaseInfo payloads for the given continent.
 * @param continentId ID of the continent for which to retrieve bases.
 * Will be rounded to an integer as part of the URL generation.
 */
async function getBasesFromContinent(
    continentId: number
): Promise<Array<BaseInfo>> {
    const url = `${restEndpoint}bases/info?continent_id=${Math.round(
        continentId
    )}`;
    return await fetch(url).then((value) => {
        return (value.json() as unknown) as Array<BaseInfo>;
    });
}

/**
 * Return the ContinentInfo payload for the given continent.
 * @param continentId ID of the continent to retrieve. Will be rounded
 * to an integer as part of the URL generation.
 */
async function getContinent(continentId: number): Promise<ContinentInfo> {
    const url = `${restEndpoint}continents/info?continent_id=${Math.round(
        continentId
    )}`;
    return (
        await fetch(url).then((value) => {
            return (value.json() as unknown) as Array<ContinentInfo>;
        })
    )[0];
}
