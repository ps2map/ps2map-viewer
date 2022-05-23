/// <reference path="./api/index.ts" />
/// <reference path="./hero-map.ts" />
/// <reference path="./minimap.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    const heroMap = new HeroMap(document.getElementById("hero-map") as HTMLDivElement);
    const minimap = new Minimap(document.getElementById("minimap") as HTMLDivElement);

    heroMap.onBaseOwnershipChanged.push(minimap.setBaseOwnership.bind(minimap));
    heroMap.onContinentChanged.push(minimap.setContinent.bind(minimap));
    heroMap.onViewboxChanged.push(minimap.setViewbox.bind(minimap));
    minimap.onJumpTo.push(heroMap.jumpTo.bind(heroMap));

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