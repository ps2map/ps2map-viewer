# APL (Potato Mode)

A standalone alternative to the main [APL website](https://github.com/auto-pl/apl-website) for me to play around in.

This mostly serves to allow me to relearn web development, get more comfortable with TypeScript, all without frameworks or other bloat.

## Development notes

- Configure your TypeScript compiler to run in watch mode, i.e. have it automatically compile everything and distribute these JS files with every commit.
- TypeScript files live in `src/`
- No modules for now. Use triple-slash references instead.
- ES3 target for no particular reason. This is not targeting any specific browser, but JS should be as potato-compatible as possible until I make up my mind.

> **Note:** This repository has been mixed-and-matched from a number of early branches in the [auto-pl/apl-website](https://github.com/auto-pl/apl-website) repository as it strayed too far from the main architecture on that branch.
>
> A number of commits containing large image assets and other bloat have been intentionally excluded from this repository to keep it small.
>
> The resulting partial commits have been kept to help with code and file history, but do not always result in usable states for commits prior to May 2021.

### Base icon generation

The base icons are exported as SVGs without background. The corresponding faction-coloured circle is then added via CSS.

Here are the steps for exporting the icons from the Illustrator source:

- Hide the red background from the icon
- Export as SVG (not "save as", the latter adds more junk)
- Check "Use Artboards" option so the icons are not cropped
- Advanced options:

  Styling: inline
  Object IDs: minimal
  Decimals: 2
  "Minify" enabled
  "Repsonsive" enabled

  Take a look at the resulting SVG in a text editor and optionally clear out any unused styles.
