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
function getBasesFromContinent(continentId: number): Promise<Array<BaseInfo>> {
    const rounded = Math.round(continentId);
    const url = `${restEndpoint}bases/info?continent_id=${rounded}`;
    return fetch(url).then((value) => {
        return (value.json() as unknown) as Array<BaseInfo>;
    });
}

/**
 * Return the BaseInfo payload for the given base.
 * @param baseId ID of the base to retrieve. Will be rounded to an
 * integer as part of the URL generation.
 */
function getBase(baseId: number): Promise<BaseInfo> {
    const rounded = Math.round(baseId);
    const url = `${restEndpoint}bases/info?base_id=${rounded}`;
    return fetch(url)
        .then((value) => {
            return (value.json() as unknown) as Array<BaseInfo>;
        })
        .then((contInfoList) => {
            return contInfoList[0];
        });
}

/**
 * Return the ContinentInfo payload for the given continent.
 * @param continentId ID of the continent to retrieve. Will be rounded
 * to an integer as part of the URL generation.
 */
function getContinent(continentId: number): Promise<ContinentInfo> {
    const rounded = Math.round(continentId);
    const url = `${restEndpoint}continents/info?continent_id=${rounded}`;
    return fetch(url)
        .then((value) => {
            return (value.json() as unknown) as Array<ContinentInfo>;
        })
        .then((contInfoList) => {
            return contInfoList[0];
        });
}
