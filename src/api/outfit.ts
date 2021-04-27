/**
 * Static data representation of an player outfit.
 */
export interface OutfitInfo {
  readonly id: bigint;
  readonly faction_id: number;
  readonly server_id: number;
  readonly name: string;
  readonly tag?: string;
}