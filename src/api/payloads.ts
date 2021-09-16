namespace Api {
    /**
     * Static base information to load and cache.
     */
    export interface BaseInfo {
        readonly id: number;
        readonly continent_id: number;
        readonly name: string;
        readonly map_pos: [number, number]; // Map coordinate of the base icon & name
        readonly type_id: number;
        readonly type_name: string;
        readonly resource_amount: number;
        readonly resource_id ? : number;
        readonly resource_name ? : string;
    }

    /**
     * Dynamic base status
     */
    export interface BaseStatus {
        readonly id: number;
        readonly server_id: number;
        readonly population: Population;
        readonly owning_faction ? : number;
        readonly owning_outfit ? : number;
        readonly held_since: number; // UTC timestamp of the last cap or reset
    }

    /**
     * Static continent data, loaded once and cached.
     */
    export interface ContinentInfo {
        readonly id: number;
        readonly name: string;
        readonly code: string;
        readonly description: string;
        readonly lattice_links: Array < [number, number] > ; // Numbers are base IDs
    }

    /**
     * Dynamic continent status
     */
    export interface ContinentStatus {
        readonly id: number;
        readonly server_id: number;
        readonly population: Population;
        readonly status: "open" | "locked";
        readonly locked_by ? : number;
        readonly alert_active: boolean;
        readonly alert_started ? : number;
        readonly alert_ends ? : number;
    }

    /**
     * Faction-specific population data.
     */
    export interface Population {
        readonly NC: number;
        readonly TR: number;
        readonly VS: number;
        readonly NSO: number;
    }

    /**
     * Static data representation of an player outfit.
     */
    export interface OutfitInfo {
        readonly id: bigint;
        readonly faction_id: number;
        readonly server_id: number;
        readonly name: string;
        readonly tag ? : string;
    }

    /**
     * Static data for a PS2 game server.
     */
    export interface ServerInfo {
        readonly id: number; // Integer
        readonly name: string;
        readonly region: "Asia" | "EU" | "US West" | "US East";
    }

    /**
     * Dynamic server data used for status display.
     */
    export interface ServerStatus {
        readonly id: number;
        readonly status: "online" | "locked";
        readonly population: Population;
        readonly open_continents: Array < number > ;
    }

    /**
     * Mapping of string base IDs to their outline SVG.
     */
    export interface BaseSvgMapping {
        [key: string]: string;
    }
}