/**
 * Static base information to load and cache.
 */
interface BaseInfo {
    readonly id: number;
    readonly continent_id: number;
    readonly name: string;
    readonly map_pos: [number, number]; // Map coordinate of the base icon & name
    readonly type_id: number;
    readonly type_name: string;
    readonly resource_amount: number;
    readonly resource_id?: number;
    readonly resource_name?: string;
}

/**
 * Dynamic base update
 */
interface BaseStatus {
    readonly id: number;
    readonly server_id: number;
    readonly population: Population;
    readonly owning_faction?: number;
    readonly owning_outfit?: number;
    readonly held_since: number; // UTC timestamp of the last cap or reset
}

/**
 * Static continent data, loaded once and cached.
 */
interface ContinentInfo {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly lattice_links: Array<[number, number]>; // Numbers are base IDs
    readonly map_base_svgs: BaseSvgMapping;
    readonly map_tileset: string;
}

/**
 * Dynamic continent update
 */
interface ContinentStatus {
    readonly id: number;
    readonly server_id: number;
    readonly population: Population;
    readonly status: string;
    readonly locked_by?: number;
    readonly alert_active: boolean;
    readonly alert_started?: number;
    readonly alert_ends?: number;
}

/**
 * Faction-specific population data.
 */
interface Population {
    readonly NC: number;
    readonly TR: number;
    readonly VS: number;
    readonly NSO: number;
}/**
 * Static data representation of an player outfit.
 */
interface OutfitInfo {
    readonly id: bigint;
    readonly faction_id: number;
    readonly server_id: number;
    readonly name: string;
    readonly tag?: string;
}

/**
 * Static data for a PS2 game server.
 */
interface ServerInfo {
    readonly id: number; // Integer
    readonly name: string;
    readonly region: string;
}

/**
 * Dynamic server data used for status display.
 */
interface ServerUpdate {
    readonly id: number;
    readonly status: string;
    readonly population: Population;
    readonly open_continents: Array<number>;
}

/**
 * Mapping of string base IDs to their outline SVG.
 */
interface BaseSvgMapping {
    [key: string]: string
}
