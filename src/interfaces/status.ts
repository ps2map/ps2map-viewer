/**
 * Interface definition for live game data.
 */

/** Realtime base data containing capture time and controlling faction. */
interface BaseStatus {
    readonly base_id: number;
    readonly server_id: number;
    readonly owning_faction_id: number;
    readonly owned_since: string; // ISO 8601 format
}
