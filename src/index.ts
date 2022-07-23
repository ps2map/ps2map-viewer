/// <reference path="./api/index.ts" />
/// <reference path="./hero-map.ts" />
/// <reference path="./minimap.ts" />
/// <reference path="./tools/index.ts" />
/// <reference path="./events.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    const heroMap = new HeroMap(document.getElementById("hero-map") as HTMLDivElement);
    const minimap = new Minimap(document.getElementById("minimap") as HTMLDivElement);

    // Set up toolbox
    setupToolbox(heroMap);

    // Set up minimap
    document.addEventListener("ps2map_baseownershipchanged", (event) => {
        const evt = (event as CustomEvent<Events.BaseOwnershipChanged>).detail;
        minimap.updateBaseOwnership(evt.ownership);
    }, { passive: true });
    document.addEventListener("ps2map_continentchanged", (event) => {
        const evt = (event as CustomEvent<Events.ContinentChanged>).detail;
        minimap.switchContinent(evt.continent);
    }, { passive: true });
    document.addEventListener("ps2map_viewboxchanged", (event) => {
        const evt = (event as CustomEvent<ViewBoxChangedEvent>).detail;
        minimap.updateViewbox(evt.viewBox);
    }, { passive: true });
    document.addEventListener("ps2map_minimapjump", (event) => {
        const evt = (event as CustomEvent<MinimapJumpEvent>).detail;
        heroMap.jumpTo(evt.target);
    }, { passive: true });

    function serverById(id: number | string): Api.Server {
        const server = GameData.getInstance().servers().find(s => s.id == id);
        if (!server)
            throw new Error(`Server with id ${id} not found.`);
        return server;
    }

    function continentById(id: number | string): Api.Continent {
        const continent = GameData.getInstance().continents().find(c => c.id == id);
        if (!continent)
            throw new Error(`Continent with id ${id} not found.`);
        return continent;
    }

    const server_picker = document.getElementById("server-picker") as HTMLSelectElement;
    server_picker.addEventListener("change", () => {
        heroMap.switchServer(serverById(server_picker.value));
    });
    const continent_picker = document.getElementById("continent-picker") as HTMLSelectElement;
    continent_picker.addEventListener("change", () => {
        heroMap.switchContinent(continentById(continent_picker.value));
    });

    // Load game data
    GameData.load().then((gameData) => {
        const servers = [...gameData.servers()];
        const continents = [...gameData.continents()];
        // Populate server picker
        servers.sort((a, b) => b.name.localeCompare(a.name));
        let i = servers.length;
        while (i-- > 0) {
            const server = servers[i];
            const option = document.createElement("option");
            option.value = server.id.toString();
            // option.value = JSON.stringify(server);
            option.text = server.name;
            server_picker.appendChild(option);
        }
        // Populate continent picker
        continents.sort((a, b) => b.name.localeCompare(a.name));
        i = continents.length;
        while (i-- > 0) {
            const cont = continents[i];
            const option = document.createElement("option");
            option.value = cont.id.toString();
            // option.value = JSON.stringify(cont);
            option.text = cont.name;
            continent_picker.appendChild(option);
        }
        // Set default server and continent
        heroMap.switchServer(serverById(server_picker.value));
        heroMap.switchContinent(continentById(continent_picker.value));
    });
});