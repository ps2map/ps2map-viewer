/**
 * Factory for dynamically creating DOM objects from strings.
 * @param html The HTML literal to parse.
 * @returns The DOM element represented by the string.
 * @throws If the given string did not produce a DOM element.
 */
function elementFromString<T>(html: string): T {
    const factory = document.createElement("template");
    factory.innerHTML = html.trim();
    const child = <T | null>factory.content.firstChild;
    if (child == null) {
        throw "given string did not result in a valid DOM object";
    }
    return child;
}
