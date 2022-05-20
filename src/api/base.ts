namespace Api {

    /**
     * Static base information.
     */
    export interface Base {
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

    export async function getBasesFromContinent(id: number): Promise<Base[]> {
        const response = await fetch(getBasesFromContinentUrl(id));
        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    }

}