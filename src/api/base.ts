/// <reference path="./interfaces.ts" />
/// <reference path="constants.ts" />


async function getBaseInfo(continentId: number): Promise<Array<BaseInfo>> {
    const url = restEndpoint + `bases/info?continent_id=${continentId}`;
    return await fetch(url).then(
        (value) => {
            return (value.json() as unknown as Array<BaseInfo>);
        });
}
