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
        if (!response.ok)
            throw new Error(response.statusText);
        return await response.json();
    }

    export async function getContinentOutlinesSvg(continent: Continent): Promise<SVGElement> {
        const response = await fetch(getContinentOutlinesPath(continent.code));
        // Handle HTTP errors
        if (!response.ok)
            throw new Error(response.statusText);
        const payload = await response.text();
        // Create SVG element from string response
        const factory = document.createElement("template");
        factory.innerHTML = payload;
        // Extract the SVG node
        const svg = factory.content.firstElementChild;
        if (!(svg instanceof SVGElement))
            throw "Unable to load contents from map hex SVG";
        return svg;
    }

}
