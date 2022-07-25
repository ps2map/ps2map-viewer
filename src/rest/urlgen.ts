/**
 * Endpoint definition and URL generation for the API.
 */
class UrlGen {
    private static restEndpoint = "http://127.0.0.1:5000/";

    public static serverList(): string {
        return `${this.restEndpoint}server`;
    }

    public static continentList(): string {
        return `${this.restEndpoint}continent`;
    }

    public static latticeForContinent(continentId: number): string {
        return `${this.restEndpoint}lattice?continent_id=${continentId}`;
    }

    public static basesForContinent(continentId: number): string {
        return `${this.restEndpoint}base?continent_id=${continentId}`;
    }

    public static mapBackground(code: string): string {
        return `${this.restEndpoint}static/minimap/${code}.jpg`;
    }

    public static terrainTile(code: string, pos: [string, string], lod: number): string {
        const filename = `${code}_tile_${pos[0]}_${pos[1]}_lod${lod}.jpeg`;
        return `${this.restEndpoint}static/tile/${filename}`;
    }

    public static continentOutlines(code: string): string {
        return `${this.restEndpoint}static/hex/${code}-minimal.svg`;
    }

    public static baseStatus(continentId: number, serverId: number): string {
        return `${this.restEndpoint}base/status?continent_id=${continentId}&server_id=${serverId}`;
    }
}