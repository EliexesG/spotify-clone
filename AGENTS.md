# AGENTS.md

## Commands

- `npm start` — dev server at http://localhost:4200 (Angular 22, standalone components, no NgModules, zoneless).
- `ng build` — use this as the verification step (typecheck + strict template checks; no separate lint/tsc script). Fails on bundle budgets: initial 500kB warn / 1MB error; component styles 4kB warn / 8kB error — large SCSS files break the production build.
- `npx ng test --watch=false` — Vitest via the `@angular/build:unit-test` builder (jsdom environment). No Chrome needed. Only `src/app/app.spec.ts` exists; schematics are configured with `skipTests: true` so generated components/directives/pipes/services produce no spec files.
- No lint config or script. Prettier is configured in `package.json` (HTML files use the `angular` parser).

## Architecture

- Layers under `src/app/`: `screens/` (page components: `scaffold`, `main-screen`), `components/` (`library-section`, `reproduction`), `services/`, `interfaces/`, `directives/`.
- Root `App` renders `Scaffold` directly; `app.routes.ts` is empty and `RouterOutlet` there is unused so far.
- Zoneless since the v22 upgrade: no zone.js anywhere. All template state must be signals (`signal`/`computed`/`effect`, `takeUntilDestroyed`), not stores; every component explicitly pins `ChangeDetectionStrategy.Eager` (deliberate — keep it when adding components unless consciously migrating to OnPush).
- Audio playback: `AudioResolver` wraps `HTMLAudioElement`s behind signals/BehaviorSubject (playing/volume/duration/currentTime) — it's the only place `new Audio(...)` lives. `MusicPlayer` and `PlaylistPlayer` are facades over it.

## Data ("database")

- Music data is static JSON imported directly into services via `resolveJsonModule`: `public/db/songs.json` and `public/db/playlist.json`. `CrudMusic`/`CrudPlaylist` are just query helpers over these arrays.
- `playlist.music` holds song IDs that must reference `songs.json` entries. Audio files live in `public/songs/`, icons in `public/icons/`. Adding music = edit JSON + drop files.

## Gotchas

- Angular 22 naming: no `.component`/`.service` suffixes (`app.ts`, `music-player.ts`). `ng generate component <name>` creates the folder with `.ts`/`.html`/`.scss`.
- TypeScript 6.x required by v22 — keep `~6.0` pinned; `@types/node` tracks the installed Node major (currently ^26, Node 20 not supported by v22).
- SSR was removed entirely (files, deps, scripts, hydration) — don't reintroduce `main.server.ts`/`@angular/ssr` unless intended; re-enable path is `ng add @angular/ssr`.
- Branches: default branch `main`; active development happens on `dev`.
