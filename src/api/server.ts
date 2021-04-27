import { Population } from "./continent";

/**
 * Static data for a PS2 game server.
 */
export interface ServerInfo {
  readonly id: number; // Integer
  readonly name: string;
  readonly region: string;
}

/**
 * Dynamic server data used for status display.
 */
export interface ServerUpdate {
  readonly id: number;
  readonly status: string;
  readonly population: Population;
  readonly open_continents: Array<number>;
}