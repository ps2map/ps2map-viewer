/// <reference path="./api/index.ts" />
/// <reference path="./hero-map.ts" />
/// <reference path="./minimap.ts" />
/// <reference path="./tools/index.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    const heroMap = new HeroMap(document.getElementById("hero-map") as HTMLDivElement);
    const minimap = new Minimap(document.getElementById("minimap") as HTMLDivElement);

    document.addEventListener("ps2map_baseownershipchanged", (event) => {
        const evt = (event as CustomEvent<BaseOwnershipChangedEvent>).detail;
        minimap.setBaseOwnership(evt.baseId, evt.factionId);
    }, { passive: true });
    document.addEventListener("ps2map_continentchanged", (event) => {
        const evt = (event as CustomEvent<ContinentChangeEvent>).detail;
        minimap.setContinent(evt.continent);
    }, { passive: true });
    document.addEventListener("ps2map_viewboxchanged", (event) => {
        const evt = (event as CustomEvent<ViewBoxChangedEvent>).detail;
        minimap.setViewBox(evt.viewBox);
    }, { passive: true });
    document.addEventListener("ps2map_minimapjump", (event) => {
        const evt = (event as CustomEvent<MinimapJumpEvent>).detail;
        heroMap.jumpTo(evt.target);
    }, { passive: true });

    // Load server list
    const server_picker = document.getElementById("server-picker") as HTMLSelectElement;
    server_picker.addEventListener("change", () => {
        const server = JSON.parse(server_picker.value);
        heroMap.setServer(server);
    });
    Api.getServerList().then((servers) => {
        servers.sort((a, b) => b.name.localeCompare(a.name));
        let i = servers.length;
        while (i-- > 0) {
            const server = servers[i];
            const option = document.createElement("option");
            option.value = JSON.stringify(server);
            option.text = server.name;
            server_picker.appendChild(option);
        }
        heroMap.setServer(JSON.parse(continent_picker.value));
    })

    // Load continent list
    const continent_picker = document.getElementById("continent-picker") as HTMLSelectElement;
    continent_picker.addEventListener("change", () => {
        const cont = JSON.parse(continent_picker.value);
        heroMap.setContinent(cont);
    });
    Api.getContinentList().then((continents) => {
        continents.sort((a, b) => b.name.localeCompare(a.name));
        let i = continents.length;
        while (i-- > 0) {
            const cont = continents[i];
            const option = document.createElement("option");
            option.value = JSON.stringify(cont);
            option.text = cont.name;
            continent_picker.appendChild(option);
        }
        heroMap.setContinent(JSON.parse(continent_picker.value));
    });
});