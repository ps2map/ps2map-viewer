namespace Api {

    /**
     * Static base information to load and cache.
     */
    export interface Base {
        readonly id: number;
        readonly continent_id: number;
        readonly name: string;
        readonly map_pos: [number, number]; // Map coordinate of the base icon & name
        readonly type_name: string;
        readonly type_code: string;
        readonly resource_capture_amount: number;
        readonly resource_control_amount: number;
        readonly resource_name?: string;
        readonly resource_code?: string;
    }

    /**
     * Static continent data, loaded once and cached.
     */
    export interface Continent {
        readonly id: number;
        readonly name: string;
        readonly code: string;
        readonly description: string;
    }

}