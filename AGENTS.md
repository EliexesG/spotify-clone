# AGENTS.md

## Commands

- `npm start` — dev server at http://localhost:4200 (Angular 20, standalone components, no NgModules).
- `ng build` — use this as the verification step (typecheck + strict template checks; no separate lint/tsc script). Fails on bundle budgets: initial 500kB warn / 1MB error; component styles 4kB warn / 8kB error — large SCSS files break the production build.
- `ng test` — Karma/Jasmine, requires Chrome. Only `src/app/app.spec.ts` exists; schematics are configured with `skipTests: true` so generated components/directives/pipes/services produce no spec files.
- No lint config or script. Prettier is configured in `package.json` (HTML files use the `angular` parser).

## Architecture

- Layers under `src/app/`: `screens/` (page components: `scaffold`, `main-screen`), `components/` (`library-section`, `reproduction`), `services/`, `interfaces/`, `directives/`.
- Root `App` renders `Scaffold` directly; `app.routes.ts` is empty and `RouterOutlet` is unused so far.
- Audio playback: `AudioResolver` wraps a single `HTMLAudioElement` behind signals (playing/volume/duration/currentTime). `MusicPlayer` and `PlaylistPlayer` are facades over it — don't create audio elements outside `AudioResolver`.
- State is signal-based (`signal`/`computed`/`effect`, `takeUntilDestroyed`), not NgRx or BehaviorSubject stores (except inside `AudioResolver`).

## Data ("database")

- Music data is static JSON imported directly into services via `resolveJsonModule`: `public/db/songs.json` and `public/db/playlist.json`. `CrudMusic`/`CrudPlaylist` are just query helpers over these arrays.
- `playlist.music` holds song IDs that must reference `songs.json` entries. Audio files live in `public/songs/`, icons in `public/icons/`. Adding music = edit JSON + drop files.

## Gotchas

- Angular 20 naming: no `.component`/`.service` suffixes (`app.ts`, `music-player.ts`). `ng generate component <name>` creates the folder with `.ts`/`.html`/`.scss`.
- `app.routes.server.ts` marks everything `RenderMode.Prerender`, but `angular.json` has `ssr: false` / `prerender: false` — the `serve:ssr:spotify-clone` script is stale; no server bundle is emitted.
- Branches: default branch `main`; active development happens on `dev`.
