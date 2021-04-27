/// <reference path="./interfaces.ts" />
/// <reference path="constants.ts" />


async function getContinentInfo(continent_id: number): Promise<ContinentInfo> {
    const url = `${rest_endpoint}continents/info?continent_id=${continent_id}`;
    return (await fetch(url).then(
        (value) => {
            return (value.json() as unknown as Array<ContinentInfo>);
        }))[0];
}
