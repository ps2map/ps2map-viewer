// API payload interfaces for dynamic game status data.
//
// These payloads may either be provided as part of the initial map load, or
// sent through the WebSocket connection as incremental updates.

/**
 * Capture status of a Base.
 *
 * @remarks
 * The owned_since field is an ISO 8601 timestamp in UTC. For bases that have
 * not yet been captured, the timestamp is set to the respective continent's
 * time of unlock. Example: "2022-01-01T00:00:00.000"
 */
interface BaseStatus {
    readonly base_id: number;
    readonly server_id: number;
    readonly owning_faction_id: number;
    readonly owned_since: string;
}
