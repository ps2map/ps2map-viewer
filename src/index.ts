/// <reference path="./interfaces/index.ts" />
/// <reference path="./rest/index.ts" />
/// <reference path="./hero-map.ts" />
/// <reference path="./minimap.ts" />
/// <reference path="./listener.ts" />
/// <reference path="./toolbox/index.ts" />
/// <reference path="./state/index.ts" />
/// <reference path="./game-data.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    const grabber = document.getElementById("sidebar-selector") as HTMLDivElement;
    grabber.addEventListener("mousedown", (event: MouseEvent) => {
        document.body.style.cursor = "col-resize";
        const box = minimap.element.firstElementChild as HTMLDivElement;
        box.style.transition = "none";

        const sidebar = document.getElementById("sidebar") as HTMLDivElement;
        const initialWidth = sidebar.clientWidth;
        const minwidth = document.body.clientWidth * 0.1;
        const maxwidth = 512;

        const startX = event.clientX;
        const onMove = (evt: MouseEvent) => {
            const delta = evt.clientX - startX;
            let newWidth = initialWidth + delta;
            if (newWidth < minwidth)
                newWidth = minwidth;
            else if (newWidth > maxwidth)
                newWidth = maxwidth;
            document.body.style.setProperty("--sidebar-width", `${newWidth}px`);
        };

        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.body.style.removeProperty("cursor");
            box.style.removeProperty("transition");
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });

    const heroMap = new HeroMap(document.getElementById("hero-map") as HTMLDivElement);
    const minimap = new Minimap(document.getElementById("minimap") as HTMLDivElement);

    const listener = new MapListener();
    listener.subscribe((name, data) => {
        StateManager.dispatch(`map/${name}`, data);
    });

    StateManager.subscribe(State.map.baseCaptured, (state) => {
        heroMap.updateBaseOwnership(state.map.baseOwnership);
        minimap.updateBaseOwnership(state.map.baseOwnership);
    });
    StateManager.subscribe(State.user.continentChanged, (state) => {
        const cont = state.user.continent;
        const mapSize = cont ? cont.map_size : 0;
        GameData.getInstance().setActiveContinent(state.user.continent)
            .then(() => {
                heroMap.switchContinent(state.user.continent!).then(() => {
                    heroMap.updateBaseOwnership(state.map.baseOwnership);
                    heroMap.jumpTo({ x: mapSize / 2, y: mapSize / 2 });
                });
                minimap.switchContinent(state.user.continent!).then(() => {
                    minimap.updateBaseOwnership(state.map.baseOwnership);
                });
            });
    });
    StateManager.subscribe(State.user.serverChanged, (state) => {
        listener.switchServer(state.user.server!);
    });
    StateManager.subscribe(State.user.baseHovered, (state) => {
        const names = heroMap.getLayer<BaseNamesLayer>("names");
        if (names)
            names.setHoveredBase(state.user.hoveredBase);
    });

    // Set up toolbox
    StateManager.dispatch(State.toolbox.setup, heroMap);
    StateManager.dispatch(State.toolbox.setTool, Tool.id);

    // Hook up base hover event
    heroMap.viewport.addEventListener("ps2map_basehover", (event) => {
        const evt = (event as CustomEvent<BaseHoverEvent>).detail;
        const base = GameData.getInstance().getBase(evt.baseId);
        if (base)
            StateManager.dispatch(State.user.baseHovered, base);
    });

    // Set up minimap
    document.addEventListener("ps2map_viewboxchanged", (event) => {
        const evt = (event as CustomEvent<ViewBoxChangedEvent>).detail;
        minimap.updateViewbox(evt.viewBox);
    }, { passive: true });
    document.addEventListener("ps2map_minimapjump", (event) => {
        const evt = (event as CustomEvent<MinimapJumpEvent>).detail;
        heroMap.jumpTo(evt.target);
    }, { passive: true });

    const server_picker = document.getElementById("server-picker") as HTMLSelectElement;
    server_picker.addEventListener("change", () => {
        const server = GameData.getInstance().servers()
            .find(s => s.id === parseInt(server_picker.value));
        if (!server)
            throw new Error(`No server found with id ${server_picker.value}`);
        StateManager.dispatch(State.user.serverChanged, server);
    });
    const continent_picker = document.getElementById("continent-picker") as HTMLSelectElement;
    continent_picker.addEventListener("change", () => {
        const continent = GameData.getInstance().continents()
            .find(c => c.id === parseInt(continent_picker.value));
        if (!continent)
            throw new Error(`No continent found with id ${continent_picker.value}`);
        StateManager.dispatch(State.user.continentChanged, continent);
    });

    // Load game data
    GameData.load().then((gameData) => {
        const servers = [...gameData.servers()];
        const continents = [...gameData.continents()];
        // Populate server picker
        servers.sort((a, b) => b.name.localeCompare(a.name));
        let i = servers.length;
        while (i-- > 0) {
            const server = servers[i]!;
            const option = document.createElement("option");
            option.value = server.id.toString();
            option.text = server.name;
            server_picker.appendChild(option);
        }
        // Populate continent picker
        continents.sort((a, b) => b.name.localeCompare(a.name));
        i = continents.length;
        while (i-- > 0) {
            const cont = continents[i]!;
            const option = document.createElement("option");
            option.value = cont.id.toString();
            option.text = cont.name;
            continent_picker.appendChild(option);
        }
        // Set default server and continent
        StateManager.dispatch(State.user.serverChanged, servers[servers.length - 1]);
        StateManager.dispatch(State.user.continentChanged, continents[continents.length - 1]);
    });
});
