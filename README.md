# SpotifyClone

A Spotify web-player clone built with [Angular](https://angular.dev) (v22, standalone components, zoneless) — playback is the core real functionality; the rest of the UI replicates Spotify visually.

## Development server

```bash
npm run dev
```

Open `http://localhost:4200/`. The application automatically reloads when source files change.

## Building

```bash
ng build
```

This compiles the project (with strict template type-checking) into `dist/`. Bundle budgets are enforced in production builds.

## Running unit tests

```bash
npx ng test --watch=false
```

Unit tests run with [Vitest](https://vitest.dev) via the `@angular/build:unit-test` builder (jsdom environment — no browser needed).

## Additional resources

For more information on the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
