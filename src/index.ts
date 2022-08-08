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
        let minWidth = 0.1;
        minWidth *= document.body.clientWidth;
        const maxWidth = 512;

        const startX = event.clientX;
        const onMove = (evt: MouseEvent) => {
            const delta = evt.clientX - startX;
            let newWidth = initialWidth + delta;
            if (newWidth < minWidth)
                newWidth = minWidth;
            else if (newWidth > maxWidth)
                newWidth = maxWidth;
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
        StateManager.dispatch(`map/${name}`, data as never);
    });

    StateManager.subscribe(State.map.baseCaptured, state => {
        heroMap.updateBaseOwnership(state.map.baseOwnership);
        minimap.updateBaseOwnership(state.map.baseOwnership);
    });
    StateManager.subscribe(State.user.continentChanged, state => {
        const cont = state.user.continent;
        const mapSize = cont ? cont.map_size : 0;
        GameData.getInstance().setActiveContinent(state.user.continent)
            .then(() => {
                if (state.user.continent) {
                    heroMap.switchContinent(state.user.continent).then(() => {
                        heroMap.updateBaseOwnership(state.map.baseOwnership);
                        heroMap.jumpTo({ x: mapSize / 2, y: mapSize / 2 });
                    });
                    minimap.switchContinent(state.user.continent).then(() => {
                        minimap.updateBaseOwnership(state.map.baseOwnership);
                    });
                }
            });
    });

    StateManager.subscribe(State.user.serverChanged, state => {
        if (state.user.server)
            listener.switchServer(state.user.server);
    });
    StateManager.subscribe(State.user.baseHovered, state => {
        const names = heroMap.getLayer<BaseNamesLayer>("names");
        if (names)
            names.setHoveredBase(state.user.hoveredBase);
    });

    // Set up toolbox
    StateManager.dispatch(State.toolbox.setup, heroMap as never);
    StateManager.dispatch(State.toolbox.setTool, Tool.id as never);

    // Hook up base hover event
    heroMap.viewport.addEventListener("ps2map_basehover", event => {
        const evt = (event as CustomEvent<BaseHoverEvent>).detail;
        const base = GameData.getInstance().getBase(evt.baseId);
        if (base)
            StateManager.dispatch(State.user.baseHovered, base as never);
    });

    // Set up minimap
    document.addEventListener("ps2map_viewboxchanged", event => {
        const evt = (event as CustomEvent<ViewBoxChangedEvent>).detail;
        minimap.updateViewbox(evt.viewBox);
    }, { passive: true });
    document.addEventListener("ps2map_minimapjump", event => {
        const evt = (event as CustomEvent<MinimapJumpEvent>).detail;
        heroMap.jumpTo(evt.target);
    }, { passive: true });

    const serverPicker = document.getElementById("server-picker") as HTMLSelectElement;
    serverPicker.addEventListener("change", () => {
        const server = GameData.getInstance().servers()
            .find(s => s.id === parseInt(serverPicker.value, 10));
        if (!server)
            throw new Error(`No server found with id ${serverPicker.value}`);
        StateManager.dispatch(State.user.serverChanged, server as never);
    });
    const continentPicker = document.getElementById("continent-picker") as HTMLSelectElement;
    continentPicker.addEventListener("change", () => {
        const continent = GameData.getInstance().continents()
            .find(c => c.id === parseInt(continentPicker.value, 10));
        if (!continent)
            throw new Error(`No continent found with id ${continentPicker.value}`);
        StateManager.dispatch(State.user.continentChanged, continent as never);
    });

    // Load game data
    GameData.load().then(gameData => {
        const servers = [...gameData.servers()];
        const continents = [...gameData.continents()];
        // Populate server picker
        servers.sort((a, b) => a.name.localeCompare(b.name));
        servers.forEach(server => {
            const option = document.createElement("option");
            option.value = server.id.toString();
            option.text = server.name;
            serverPicker.appendChild(option);
        });
        // Populate continent picker
        continents.sort((a, b) => a.name.localeCompare(b.name));
        continents.forEach(cont => {
            const option = document.createElement("option");
            option.value = cont.id.toString();
            option.text = cont.name;
            continentPicker.appendChild(option);
        });
        // Set default server and continent
        StateManager.dispatch(State.user.serverChanged,
            servers[0] as never);
        StateManager.dispatch(State.user.continentChanged,
            continents[0] as never);
    });
});
