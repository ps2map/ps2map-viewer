/**
 * Endpoint definitions and URL generation helpers for the API.
 */

namespace Api {

    /** REST interface endpoint URL. */
    export const restEndpoint = "http://127.0.0.1:5000/";

    export function getContinentListUrl(): string {
        return `${restEndpoint}continent`;
    }

    export function getBasesFromContinentUrl(id: number): string {
        return `${restEndpoint}base?continent_id=${id}`;
    }

    export function getMinimapImagePath(code: string): string {
        return `${restEndpoint}static/minimap/${code}.jpg`;
    }

    export function getTerrainTilePath(
        code: string,
        pos: [string, string],
        lod: number): string {

        const filename = `${code}_tile_${pos[0]}_${pos[1]}_lod${lod}.jpeg`;
        return `${restEndpoint}static/tile/${filename}`;
    }

    export function getHexesPath(code: string): string {
        return `${restEndpoint}static/hex/${code}-minimal.svg`
    }

    export function getBaseOwnershipUrl(
        continent_id: number,
        server_id: number): string {

        return `${restEndpoint}base/status?continent_id=${continent_id}&server_id=${server_id}`;
    }

}