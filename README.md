# APL (Potato Mode)

A standalone alternative to the main [APL website](https://github.com/auto-pl/apl-website) for me to play around in.

This mostly serves to allow me to relearn web development, get more comfortable with TypeScript, all without frameworks or other bloat.

## Development notes

- Configure your TypeScript compiler to run in watch mode, i.e. have it automatically compile everything and distribute these JS files with every commit.
- TypeScript files live in `src/`
- No modules for now. Use triple-slash references instead.
- ES3 target for no particular reason. This is not targeting any specific browser, but JS should be as potato-compatible as possible until I make up my mind.
