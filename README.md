# PlanetSide 2 Map Viewer

A lean, high performance HTML5 web app for viewing and annotating (soon:tm:) [PlanetSide 2](https://www.planetside2.com/) maps.

## Development Version

This application is not yet live and requires a local API server to function. Refer to the [PS2 Map API repository](https://github.com/leonhard-s/ps2-map-api) for details.

## Features

- Client-side rendering
- Smooth 60 FPS map interactions
- Touch support
- Annotation and drawing canvas (deferred)
- Shared rooms (deferred)

## Development notes

- Configure your TypeScript compiler to run in watch mode, i.e. have it automatically compile everything and distribute these JS files with every commit.
- TypeScript files live in `src/`
- No modules for now. Use triple-slash references instead.
- ES3 target for no particular reason. This is not targeting any specific browser, but JS should be as potato-compatible as possible until I make up my mind.

### Base icon generation

The base icons are exported as SVGs without background. The corresponding faction coloured circle is then added via CSS.

Here are the steps for exporting the icons from the Illustrator source:

- Hide the red background from the icon
- Export as SVG (not "save as", the latter adds more junk)
- Check "Use Artboards" option, so the icons are not cropped
- Advanced options:

  Styling: inline
  Object IDs: minimal
  Decimals: 2
  "Minify" enabled
  "Responsive" enabled

  Take a look at the resulting SVG in a text editor and optionally clear out any unused styles.
