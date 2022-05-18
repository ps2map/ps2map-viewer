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
    export function getBasesFromContinent(continentId: number): Promise<Array<Api.Base>> {
        const rounded = Math.round(continentId);
        const url = `${restEndpoint}base?continent_id=${rounded}`;
        return fetch(url).then((value) => {
            return value.json() as unknown as Array<Api.Base>;
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
    ): Promise<Api.Continent> {
        const url = `${restEndpoint}continent`;
        return fetch(url)
            .then((value) => {
                return value.json() as unknown as Array<Api.Continent>;
            })
            .then((contList) => {
                for (let i = 0; i < contList.length; i++) {
                    const cont = contList[i];
                    if (cont.id == continentId) return cont;
                }
                throw `unknown continent ID: ${continentId}`;
            });
    }

    /**
     * Return the minimap path for the given continent code.
     * @param continentCode Code of the continent for which to retrieve the
     * minimap asset path.
     */
    export function getMinimapImagePath(continentCode: string): string {
        return `${restEndpoint}static/minimap/${continentCode}.jpg`;
    }

    /**
     * Return the terrain tile path for a given position, continent, and lod.
     * @param continentCode ID of the continent for which to retrieve the tile.
     * @param pos Position of the tile to retrieve.
     * @param lod LOD of the tile to retrieve.
     * 
     * 
     */
    export function getTerrainTilePath(
        continentCode: string,
        pos: [string, string],
        lod: number): string {

        const filename = `${continentCode}_tile_${pos[0]}_${pos[1]}_lod${lod}.jpeg`;
        return `${restEndpoint}static/tile/${filename}`;
    }

    /** Temporary getter for REST API endpoint. */
    export function getApiEndpoint(): string {
        return restEndpoint;
    }
}