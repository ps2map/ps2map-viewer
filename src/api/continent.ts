/// <reference path="./interfaces.ts" />
/// <reference path="constants.ts" />


async function getContinentInfo(continentId: number): Promise<ContinentInfo> {
    const url = `${restEndpoint}continents/info?continent_id=${continentId}`;
    return (await fetch(url).then(
        (value) => {
            return (value.json() as unknown as Array<ContinentInfo>);
        }))[0];
}
