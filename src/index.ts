/// <reference path="./hero-map.ts" />
/// <reference path="./api/index.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    const dropdown = document.getElementById("continent-selector") as HTMLSelectElement;

    // Initialise the map controller for the primary map
    const viewport = document.getElementById("hero-map");
    if (viewport == null) {
        throw "Unable to locate viewport element";
    }
    if (viewport.tagName != "DIV") {
        throw `Expected viewport of type "DIV" (got ${viewport.tagName})`;
    }
    const heroMap = new HeroMap(viewport as HTMLDivElement);


    // TODO: Create loading screen or other UI to indicate that we are talking
    // to the API
    console.log("Loading available continents...");

    Api.getContinentList()
        .then((continentList) => {
            continentList.sort((a, b) => b.name.localeCompare(a.name))
            // Populate continent selection dropdown

            let i = continentList.length;
            while (i--) {
                const cont = continentList[i];
                const option = document.createElement("option");
                option.value = JSON.stringify(cont);
                option.text = cont.name;
                dropdown.appendChild(option);
            }

            heroMap.setContinent(JSON.parse(dropdown.value));
        });

    // Hook up event handlers for map selection
    dropdown.addEventListener("change", (event) => {
        if (event.target == null) {
            return;
        }
        const continent = JSON.parse(dropdown.value);
        console.log(`Switching to ${continent.name}...`);
        heroMap.setContinent(continent);
    });
});