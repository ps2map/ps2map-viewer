/// <reference path="./interfaces.ts" />
/// <reference path="constants.ts" />


async function getBaseInfo(continent_id: number): Promise<Array<BaseInfo>> {
    const url = rest_endpoint + `bases/info?continent_id=${continent_id}`;
    return await fetch(url).then(
        (value) => {
            return (value.json() as unknown as Array<BaseInfo>);
        });
}
