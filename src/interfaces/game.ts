// API payload interfaces fpr game objects.
//
// These payloads are generally only sent for initial application load, or
// when the user loads a new map.

/** A PS2 game server, such as Cobalt, Connery, or SolTech. */
interface Server {
    readonly id: number;
    readonly name: string;
    readonly region: string;
    readonly platform: string;
}

/** A playable continent with available map data. */
interface Continent {
    readonly id: number;
    readonly name: string;
    readonly code: string;
    readonly description: string;
    readonly map_size: number;
}

/**
 * A link between two bases in the game lattice.
 *
 * @remarks
 * The unique base IDs are sorted in ascending order, base_a_id < base_b_id.
 * For convenience, this payload also contains the map positions of both bases.
 */
interface LatticeLink {
    readonly base_a_id: number;
    readonly base_b_id: number;
    readonly map_pos_a_x: number;
    readonly map_pos_a_y: number;
    readonly map_pos_b_x: number;
    readonly map_pos_b_y: number;
}

/**
 * A base on a continent in the game.
 *
 * @remarks
 * Not all bases provide outfit resources. The resource_name and resource_code
 * fields are only defined for bases whose resource_*_amount fields are greater
 * than zero.
 */
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
