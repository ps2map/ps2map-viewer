/**
 * API utilities related to continent data.
 */

/// <reference path="./urlgen.ts" />

namespace Api {

    /**
     * Static continent data.
     */
    export interface Continent {
        readonly id: number;
        readonly name: string;
        readonly code: string;
        readonly description: string;
        readonly map_size: number;
    }

    export async function getContinentList(): Promise<Continent[]> {
        const response = await fetch(getContinentListUrl())
        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    }

}
