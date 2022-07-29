/**
 * Load the base outlines for a continent and return them as an SVG element.
 */
function fetchContinentOutlines(continentCode: string): Promise<SVGElement> {
    return fetch(UrlGen.continentOutlines(continentCode))
        .then(response => response.text())
        .then(payload => {
            const factory = document.createElement("template");
            factory.innerHTML = payload;
            // Extract the SVG element from the template
            const svg = factory.content.firstElementChild;
            if (!(svg instanceof SVGElement))
                throw "Unable to load contents from map hex SVG";
            return svg;
        });
}
