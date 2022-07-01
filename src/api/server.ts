/**
 * API utilities related to server data.
 */

/// <reference path="./urlgen.ts" />

namespace Api {

    /**
     * Static server data.
     */
    export interface Server {
        readonly id: number;
        readonly name: string;
        readonly region: string;
        readonly platform: string;
    }

    export async function getServerList(): Promise<Server[]> {
        const response = await fetch(getServerListUrl())
        // Handle HTTP errors
        if (!response.ok)
            throw new Error(response.statusText);
        return await response.json();
    }

}