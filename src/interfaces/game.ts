/**
 * Interface definition for static game data.
 *
 * This data is generally loaded once and cached for future use.
 */

/** A game server for which live map data can be displayed. */
interface Server {
    readonly id: number;
    readonly name: string;
    readonly region: string;
    readonly platform: string;
}

/** A continent for which map data can be shown. */
interface Continent {
    readonly id: number;
    readonly name: string;
    readonly code: string;
    readonly description: string;
    readonly map_size: number;
}

/**
 * A lattice link between two bases.
 *
 * Lattice link data is ordered for consistency: base_id_a will always be
 * lower than base_b_id.
 */
interface LatticeLink {
    readonly base_a_id: number;
    readonly base_b_id: number;
    readonly map_pos_a_x: number;
    readonly map_pos_a_y: number;
    readonly map_pos_b_x: number;
    readonly map_pos_b_y: number;
}

/** Detailed base data for a facility. */
interface Base {
    readonly id: number;
    readonly continent_id: number;
    readonly name: string;
    readonly map_pos: [number, number];
    readonly type_name: string;
    readonly type_code: string;
    readonly resource_capture_amount: number;
    readonly resource_control_amount: number;
    readonly resource_name?: string;
    readonly resource_code?: string;
}
