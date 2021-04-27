/// <reference path="./interfaces.ts" />

const rest_endpoint = "http://127.0.0.1:5000/";


async function getBaseInfo(continent_id: number): Promise<Array<BaseInfo>> {
    const url = rest_endpoint + `bases/info?continent_id=${continent_id}`;
    return await fetch(url).then(
        (value) => {
            return (value.json() as unknown as Array<BaseInfo>);
        });
}
