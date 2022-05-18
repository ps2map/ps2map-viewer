/// <reference path="./hero-map.ts" />

/** Initialisation hook for components that need to be run on DOM load. */
document.addEventListener("DOMContentLoaded", () => {

    // Decide the continent to load
    // TODO: Restore the continent from cookies or depending on status
    const continentId = 8;

    // Initialise the map controller for the primary map
    const viewport = document.getElementById("hero-map");
    if (viewport == null) {
        throw "Unable to locate viewport element";
    }
    if (viewport.tagName != "DIV") {
        throw `Expected viewport of type "DIV" (got ${viewport.tagName})`;
    }
    new HeroMap(viewport as HTMLDivElement, continentId);
});