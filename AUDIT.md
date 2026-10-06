# Codebase Audit — Spotify Clone (Angular 22)

> Snapshot: 2026-10-06, branch `dev` (`fb62cba`), post-Angular-22 upgrade.
> Purpose: reference for planning future work. Evidence verified by agent exploration; items marked *(inferred)* are reasoning, not code-verified.

## Summary

| Category | Count | Headline |
|---|---|---|
| Dead code / unused | 11 | `MainScreen` component never rendered; stray `<audio>`; empty `RouterOutlet` |
| Finished | 12 | Full transport, shuffle, queue auto-advance, library sidebar + search |
| Half-done / incomplete | 13 | Queue panel is a literal string; repeat modes; mute; header is text |
| Undone / not started | 12 | Routing, CRUD playlists, likes, persistence, responsive, a11y |
| Risks / bugs | 14 | id-space collision between playlists & songs; onended double-owner |

## A. Finished ✔

- **Library sidebar** — expand/collapse, conditional card variants (`library-section-container.html:5-16,29-35`)
- **Live search filter** — case-insensitive, trimmed; outside-click closes and clears (`library-section-container.ts:33-41`, `library-searcher.ts:33-43`)
- **Library cards** — hover highlight/dim, hover play/pause overlay, green "now playing" title (`library-card.html:15-21,29,37,43`, `library-card.ts:49-66`)
- **Card → queue load + play**, resume when clicking current queue (`library-card.ts:97-118`, `playlist-player.ts:137-152`)
- **Transport bar** — play/pause/next/prev/restart with disabled states (`reproduction-controller.html:42-81`)
- **Shuffle** — toggle + green indicator + already-played bookkeeping (`reproduction-controller.html:28-41`, `playlist-player.ts:197-199`)
- **Seek + duration + progress-fill slider** with hover thumb (`reproduction-controller.html:83-94`, `slider-controller.scss`, `highlight-slider.ts`)
- **Volume** — slider + reactive icon off/down/up (`reproduction-controller.html:103-111`)
- **Auto-advance on song end** (`playlist-player.ts:63-71`)
- **Initial preload** of playlist `'1'` first song (`scaffold.ts:20-22`)
- **Signal-based audio plumbing** — single `new Audio(...)` site (`audio-resolver.ts:17,149-155`)
- **Build/test infra** — Angular 22.2 zoneless, Vitest unit tests, budgets enforced

## B. Half-done / incomplete ◐

1. **Reproduction List panel** — literal string header in `scaffold.html:15`; no queue component, song rows, or per-row play exists.
2. **Main content area** — stub `<h1>Welcome to the Scaffold Page</h1>` + empty `<router-outlet>` (`scaffold.html:11-12`); `MainScreen` exists, empty, unused (`main-screen.ts:10`).
3. **Header** — literal "Header" text; no nav, logo, user menu (`scaffold.html:3`).
4. **Repeat modes** — only a restart button (seek-to-0); no off/all/one modes (`reproduction-controller.html:75-81`).
5. **Mute** — volume icon is reactive but not clickable (`reproduction-controller.html:103`).
6. **Decorative icon cluster** — mobile/mic/bars/headphones/maximize/expand and minus/plus-circle icons render but are plain `<i>`, no handlers/semantics (`reproduction-controller.html:19-20,99-113`).
7. **`big` card variant** — declared in `library-card.model.ts:1`, template is an empty `<div>` stub (`library-card.html:50-51`); no grid rendering path.
8. **`background` input, `colorLeft`/`colorRight` inputs** — bound nowhere; defaults only (`library-card.ts:33`, `highlight-slider.ts:17-18`).
9. **`alreadyPlayedMusicIndexes`** — maintained by shuffle, exposed but never consumed by UI (`playlist-player.ts:46-48`).
10. **Search UX** — no empty-result state, no result count, no persisted query (`library-section-container.ts:33-41`).
11. **Volume slider never disabled** even with no source loaded; transport disabled logic exists only for it (`reproduction-controller.html:104-111`).
12. **Test suite** — one shallow spec asserting a stub string; player/service logic untested (`app.spec.ts:21`).
13. **README** — stale (Karma, e2e, CLI 20.1.4); `AGENTS.md` is accurate but README is not.

## C. Undone ✗ (*inferred* unless noted)

- **Routing/navigation** — `routes` empty (`app.routes.ts:3`); no playlist-detail/home screens *(code-verified absence)*
- **Queue management UI** — view/remove/reorder tracks; no drag-drop deps *(inferred)*
- **Likes / add-to-playlist / add-to-library** *(inferred)*
- **Playlist CRUD** — `CrudMusic`/`CrudPlaylist` are read-only despite the name; no create/edit/delete/rename *(inferred)*
- **Liked-songs pseudo-playlist, recently-played history** *(inferred)*
- **Persistence** — zero localStorage/sessionStorage/IndexedDB; reload resets everything *(code-verified, grep 0 hits)*
- **Responsive layout** — zero `@media`/Tailwind breakpoints; fixed widths (`w-80/w-96`, `min-w-[500px]`) *(code-verified, grep 0 hits)*
- **Accessibility** — no aria/roles/tabindex/keyboard handlers anywhere; `outline-none` suppresses focus; interactive divs unreachable by keyboard *(code-verified, grep 0 hits)*
- **Error/buffering UX** — no `onerror`/`onwaiting` handlers; observed real failed loads leaving player silently dead (`.playwright-mcp` console logs) *(inferred from codepath)*
- **Keyboard shortcuts** — space/arrows play-pause; none *(inferred)*
- **Media Session API integration** *(inferred)*
- **Repeat+autoplay policy** / play-on-load options *(inferred)*

## D. Dead code — safe deletions

| Item | Evidence |
|---|---|
| `src/app/screens/main-screen/` (whole folder) | never imported; empty class + 0-byte html |
| `<audio hidden>` in `app.html:2` | nothing references it |
| `RouterOutlet` in `scaffold.ts:2,10` + `scaffold.html:12` | routes empty, renders nothing |
| `CrudMusic.getAllMusic()` (`crud-music.ts:13-15`) | no callers |
| `Observable` import (`music-player.ts:4`) | unused |
| `FormsModule` import (`reproduction-controller.ts:9,15`) | no ngModel in its template |
| `'big'` variant + `background` input | stubbed/never read |
| `tailwind.config.js` | 0-byte, unused in Tailwind v4 CSS-first |
| README sections on e2e/Karma | stale |

## E. Risks / bugs (fix before/with feature work)

> **Status: all items fixed on `fix/bugs` (2026-10-06).** Verified by 9 Vitest specs + Playwright regression (collision, shuffle cycle, error recovery, cover fallback).

1. ~~**ID-space collision**~~ ✅ `d91a37b` — same-namespace comparisons in `LibraryCard.play()`; regression-tested (playing song id 2 while clicking playlist id 2 now switches queues).
2. ~~**`onended` double-ownership**~~ ✅ `ae1d21d` — `addEventListener` + shared `audioEnded` stream; both owners coexist.
3. ~~**`as any` + non-null `!` in `CrudPlaylist`**~~ ✅ `e2e31f2` — typed resolution, missing ids are reported via `console.warn`.
4. ~~**`getAllPlaylists(): PlaylistSource[] | undefined`**~~ ✅ `e2e31f2` — honest signature.
5. ~~**`changeMusicSource(null)` doesn't stop audio**~~ ✅ `ae1d21d` — clears + `clearAudio()`; unit-tested.
6. ~~**Shuffle recursion stack-overflow**~~ ✅ `ae1d21d` — iterative candidate pool; 1-song playlists replay; unit-tested.
7. ~~**Reference-equality indexing**~~ ✅ `ae1d21d` — `findIndex` by id; unit-tested with copied track objects.
8. ~~**Silent audio-error loop**~~ ✅ `ae1d21d`/`d91a37b` — `error` listener + `audioError` signal + guarded/recovering `reproduceAudio()` (retry via `load()`); Playwright-verified (broken → warn, no fake playing state; restored → plays).
9. ~~**Invalid DOM**~~ ✅ `d91a37b` — `<body>`→`<div>`, `<ng-component>`→`<ng-container>`.
10. ~~**`interval(100)` polling per slider**~~ ✅ `ae1d21d` — signal/effect-driven fill, polling deleted.
11. ~~**Hardcoded playlist `'1'`**~~ ✅ `e2e31f2` — `CrudPlaylist.getDefaultPlaylist()` with fallback to first playlist.
12. **External CDN covers** ✅ `d91a37b` — in-app fallback (dark block + music note) added on `error` (user-approved scope add).
13. **Focus-visible absence** ✅ `d91a37b` — global `:focus-visible` ring; `outline-none` utilities no longer eat keyboard focus.
14. **A11y pass remains open** (aria/roles/labels) — tracked for the accessibility work item; focus styling (13) landed as the first slice.

## Suggested build order (needs owner prioritization)

1. Quick wins — D (dead code deletion) + risks #1 #2 #3 (correctness of core playback)
2. Complete the shell — queue panel (B1), header (B3), main content area (B2) → this unlocks routing
3. Routing + playlist-detail view + `big` variant grid
4. Repeat modes, mute, functional side icons (like/add)
5. CRUD playlists + persistence (localStorage or backend)
6. Responsive + accessibility pass
