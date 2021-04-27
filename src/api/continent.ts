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
  readonly resource_id?: number;
  readonly resource_name?: string;
}

export interface BaseStatus {
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
export interface ContinentInfo {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly bases: Array<BaseInfo>;
  readonly lattice_links: Array<[number, number]>; // Numbers are base IDs
  readonly map_outlines_svg: string;
  readonly map_tileset: string;
}

/**
 * Dynamic continent update
 */
export interface ContinentStatus {
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
export interface Population {
  readonly NC: number;
  readonly TR: number;
  readonly VS: number;
  readonly NSO: number;
}