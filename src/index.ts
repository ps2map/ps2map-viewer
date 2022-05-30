/// <reference path="./api/index.ts" />
/// <reference path="./hero-map.ts" />
/// <reference path="./minimap.ts" />
/// <reference path="./tools/index.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    const heroMap = new HeroMap(document.getElementById("hero-map") as HTMLDivElement);

    // Set up toolbar
    const toolbar_cursor = document.getElementById("toolbar-cursor") as HTMLInputElement;
    toolbar_cursor.addEventListener("click", () => { resetTool(); });
    document.addEventListener("keydown", (event) => {
        if (event.code === "Escape") resetTool();
    });

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

    const dropdown = document.getElementById("continent-selector") as HTMLSelectElement;
    dropdown.addEventListener("change", () => {
        heroMap.setContinent(JSON.parse(dropdown.value));
    });

    // TODO: Create loading screen or similar waiting UI
    Api.getContinentList()
        .then((continentList) => {
            continentList.sort((a, b) => b.name.localeCompare(a.name))
            let i = continentList.length;
            while (i-- > 0) {
                const cont = continentList[i];
                const option = document.createElement("option");
                option.value = JSON.stringify(cont);
                option.text = cont.name;
                dropdown.appendChild(option);
            }
            // TODO: Load last selected continent rather than the first one
            heroMap.setContinent(JSON.parse(dropdown.value));
        });
});