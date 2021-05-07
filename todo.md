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
- [ ] Switch to (vaguely) logarithmic zoom levels. The linear ones feel wrong due to the relative map size change decreasing; just an unnecessary feeling of lagginess.

## Network

- [ ] Add caching for static API data
- [ ] Look into how browser-side cache control works

## Maintainability

- [ ] Use container-relative coordinates for map pan controls (this currently only works properly if the map is fullscreen)

## Performance

- [x] Reuse icons for base outlines
- [x] Move all map zoom behaviour into a JS state register; no reading DOM as part of animation frames (heavy slowdowns!)
- [ ] Prune the DOM tree. There are about 600 elements and half of them are unaccounted for off the top of my head.
- [ ] Add resize event handler for state updates
- [ ] Simplify DOM tree, particularly hexes and base names
- [ ] Create a zoom-level-aware windowing system that lazy-updates the map and unloads data (destroying base names, etc.)
- [ ] Mooar introspection, stable 60 fps or bust!

## Bonus points

- [ ] Enable/disable scroll events when mouse is within the map (nice for embedding, if that ever happens)  
  DOMMouseScroll, onmousewheel, onwheel, ontouchmove, onkeydown, ...

## Display

- [x] ~~Figure out how to modify the fill colour of an SVG from JavaScript~~ one does not simply update non-inlined SVGs
- [x] Update SVGs to use a single fill and stroke colour, simplify geometries
- [ ] Vary base icon size based on type (warpgate > primary facility > large outpost > small outpost)
- [ ] Hide small bases at small zoom levels
