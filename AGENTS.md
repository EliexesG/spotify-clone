# AGENTS.md

## Commands

- `npm run dev` — dev server at http://localhost:4200 (Angular 22, standalone components, no NgModules, zoneless).
- `ng build` — use this as the verification step (typecheck + strict template checks; no separate lint/tsc script). Fails on bundle budgets: initial 500kB warn / 1MB error; component styles 4kB warn / 8kB error — large SCSS files break the production build.
- `npx ng test --watch=false` — Vitest via the `@angular/build:unit-test` builder (jsdom environment). No Chrome needed. Specs: `src/app/app.spec.ts`, `src/app/services/playlist-player.spec.ts`, `src/app/services/audio-resolver.spec.ts`; schematics are configured with `skipTests: true` so generated components/directives/pipes/services produce no spec files.
- No lint config or script. Prettier is configured in `package.json` (HTML files use the `angular` parser).

## Documentation (owner preference — mandatory style)

- **JSDoc every class and function**: purpose, `@param` for every parameter, `@returns`, and `@throws` when a method can error. Components/services get a class-level doc; public methods/computeds/fields get per-member docs.
- Complex function bodies get `// *` comments explaining each step (matches the existing `// * Services`, `// * Computed` region style).
- Every HTML template documents its structure with `<!-- * Section name (purpose) -->` markers at each UI part.

## Scope (owner decision — read before adding UI)

- The only core real functionality is **playback** (play/pause/seek/volume/queue/shuffle). Everything else is *merely visual*: chrome like Premium/Support/Sign up, create-playlist "+", filter chips, legal links is replicated to look like Spotify and stays non-functional. Song lists/queue are clickable because they feed playback. **Owner-approved exception:** the top-bar navigation cluster is functional (home `button` → `/`, back/forward arrows → `Location` history); all other top-bar chrome stays decorative.
- `AUDIT.md` is the living reference: feature completeness, bug status, Spotify UI parity assessment (section F), and the visual-parity scope caveat.

## Architecture

- Layers under `src/app/`: `screens/` (**routed pages only**, via `app.routes.ts`: `home-view`, `playlist-view`), `components/layout/` (shell panels composed by `scaffold`, not routed: `scaffold`, `top-bar`, `library-section`, `now-playing-section`), `components/reproduction/` (`reproduction-controller`), `components/ui/` (generic reusable, playlist+music agnostic: `source-card` + `source-card.model.ts`, `slider-controller`, `search-button`), `services/`, `interfaces/`, `directives/`.
- Root `App` renders `Scaffold` (from `components/layout/`); routing drives the center `router-outlet` (`''` → home grid, `playlist/:id` → detail).
- Zoneless since the v22 upgrade: no zone.js anywhere. All template state must be signals (`signal`/`computed`/`effect`, `takeUntilDestroyed`), not stores; every component explicitly pins `ChangeDetectionStrategy.Eager` (deliberate — keep it when adding components unless consciously migrating to OnPush).
- Audio playback: `AudioResolver` wraps `HTMLAudioElement`s behind signals/BehaviorSubject (playing/volume/duration/error/buffering) and exposes an `audioEnded` stream — it's the only place `new Audio(...)` lives, and media handlers must use `addEventListener` (never overwrite `onended` etc.). `MusicPlayer` and `PlaylistPlayer` are facades over it.

## Theming (colors)

- All theme colors are CSS custom properties in `src/styles.css`: `--primary` (#1ed760, modern Spotify green), `--secondary` (#121212 panels), `--highlight` (#1f1f1f hover), `--muted` (#b3b3b3 subtitles), `--track` (#4d4d4d slider track), `--elevated` (#181818 cards) and `--hover-elevated` (#282828 card hover). Change colors there only — never hardcode hex/grays in components.
- Tailwind v4 CSS-first: reference tokens with the parenthesized arbitrary syntax — `bg-(--secondary)`, `text-(--muted)` — not the legacy `bg-[var(--x)]` form. No `tailwind.config.js` (0-byte, unused).

## Data ("database")

- Music data is static JSON imported directly into services via `resolveJsonModule`: `public/db/songs.json` and `public/db/playlist.json`. `CrudMusic`/`CrudPlaylist` are just query helpers over these arrays (`CrudPlaylist.getDefaultPlaylist()` is the bootstrap entry point, with fallback to the first playlist).
- `playlist.music` holds song IDs that must reference `songs.json` entries; unresolved ids are `console.warn`ed by `CrudPlaylist`. Audio files live in `public/songs/`, icons in `public/icons/`. Adding music = edit JSON + drop files.

## Gotchas

- Angular 22 naming: no `.component`/`.service` suffixes (`app.ts`, `music-player.ts`). `ng generate component <name>` creates the folder with `.ts`/`.html`/`.scss`.
- TypeScript 6.x required by v22 — keep `~6.0` pinned; `@types/node` tracks the installed Node major (currently ^26, Node 20 not supported by v22).
- SSR was removed entirely (files, deps, scripts, hydration) — don't reintroduce `main.server.ts`/`@angular/ssr` unless intended; re-enable path is `ng add @angular/ssr`.
- **Never stop/kill a running dev server** — the owner runs `npm run dev` themselves and restarting it constantly is disruptive. Start one only if none is up; leave whatever is listening alone.
- Branches: default branch `main`; active development happens on `dev`.
