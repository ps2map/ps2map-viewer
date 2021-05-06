# To do

Tracker for missing features, usability improvements and other things that should not live on scraps of paper.

1. Add items that must be completed prior to the next release below
2. Commit them to `main` as they are ready
3. Check them off this list (but do not delete them yet)
4. With every release, clear this list
5. ...
6. Profit

## Features

- [ ] Create event dispatchers for base and continent updates
- [ ] Add a button to allow polling of API data
- [ ] Add capture points (& generators?) to map overlay

## User interaction

- [x] Fix zoom-to-cursor behaviour
- [x] Add support for pinch zoom gestures

## Network

- [ ] Add caching for static API data
- [ ] Look into how browser-side cache control works

## Performance

- [x] Reuse icons for base outlines
- [ ] Mooar introspection, stable 60 fps or bust!

## Display

- [x] ~~Figure out how to modify the fill colour of an SVG from JavaScript~~ one does not simply update non-inlined SVGs
- [x] Update SVGs to use a single fill and stroke colour, simplify geometries
- [ ] Vary base icon size based on type (warpgate > primary facility > large outpost > small outpost)
