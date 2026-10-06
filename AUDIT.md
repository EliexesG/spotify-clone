# Codebase Audit — Spotify Clone (Angular 22)

> Snapshot: 2026-10-06, branch `dev` (`60de758`+), Angular 22.2, TypeScript 6.0, zoneless, Vitest — single-app clone, no backend.
> Purpose: reference for current state + future work; history is condensed in section **H** (items marked *(inferred)* are reasoning, not code-verified).

> **⚠ Scope statement (owner decision, 2026-10-06):** this is **only a visual clone with a minimal music implementation** — the single core real functionality is **playback** (play/pause/seek/volume/queue/shuffle). **Nothing else is real, and nothing will be**: no CRUD of any kind (no POST/PUT/DELETE, no API calls, no backend, no persistence — the JSON files are read-only data), no full Spotify functionality. UI exists to look like Spotify: song lists/queue are clickable only because they feed playback; buttons like **Premium** (and other top-bar/account chrome) are decorative and will never do anything. Do not plan or build non-playback interactivity unless the owner explicitly asks. **Owner-approved exception (2026-10-06):** the top-bar navigation cluster is functional — home button → `/`, back/forward arrows → router visit history.

## Summary

| Category | Count | Headline |
|---|---|---|
| Dead code / unused | 0 — ✅ **cleaned (D)** | verified deletions; two entries became obsolete via G (routing, `big`) |
| Finished | 15 | Playback stack (transport/shuffle/auto-advance/silent scrub), library sidebar + search, routing + home grid + playlist song-list view, now-playing panel, top bar w/ live nav cluster |
| Half-done / incomplete | 6 open (of 13 listed) | repeat modes; mute; decorative transport icons; search empty-state; volume never disabled |
| Excluded by owner scope | — | **no CRUD/API/persistence/likes/queue-reorder** — visual clone with minimal real playback only (see ⚠) |
| Remaining open (non-scope) | 6 | shortcuts, media-session, a11y pass, error/buffering UI, responsive pass, autoplay policy |
| Risks / bugs | 17 (14 + 3 scrub round) | all ✅ fixed + verified |

## A. Finished ✔

- **Library sidebar (`LibrarySection`)** — expand/collapse, conditional card variants (`library-section.html:5-16,29-35`)
- **Live search filter** — case-insensitive, trimmed; outside-click closes and clears; shared `SearchButton` w/ site-configurable placeholder (`library-section.ts:33-41`, `search-button.ts`)
- **Source cards (`SourceCard`)** — music/playlist-agnostic; hover highlight/dim, hover play/pause overlay, green "now playing" title, image-fallback placeholder, drag/hover state via signals (`source-card.ts:49-66`)
- **Card → queue load + play**, resume when clicking current queue; body click navigates without autoplay (`source-card.ts:97-121`)
- **Routing + center views** — `''` home grid ⇄ `playlist/:id` song-list detail; wildcard redirect; deep links (`app.routes.ts`, `home-view`, `playlist-view`)
- **Home grid** — responsive `big`-card grid + empty state (`home-view.html`)
- **Playlist song-list view** — gradient header, green play button (stateful play/pause, owner-refined), track table w/ real durations, clickable rows, search filter (`playlist-view.*`)
- **Now-playing panel (`NowPlayingSection`)** — playlist-name header + big current cover (fallback) + title/artist + empty state (`now-playing-section.*`)
- **Top bar (`TopBar`)** — visual chrome + owner-approved live nav cluster (home → `/`, back/forward via `Location`) (`top-bar.*`)
- **Transport bar** — play/pause/next/prev/restart with disabled states (`reproduction-controller.html:42-81`)
- **Shuffle** — toggle + green indicator + already-played bookkeeping (`reproduction-controller.html:28-41`, `playlist-player.ts:197-199`)
- **Seek + duration + progress-fill slider** with hover thumb; **silent scrubbing** (drag = pause + preview, release = commit + resume) (`audio-resolver.ts beginScrub/endScrub`)
- **Volume** — slider + reactive icon off/down/up (`reproduction-controller.html:103-111`)
- **Auto-advance on song end** (`playlist-player.ts:63-71`)
- **Initial preload** of the default playlist's first song (`scaffold.ts:20-22`, `CrudPlaylist.getDefaultPlaylist()`)
- **Signal-based audio plumbing** — single `new Audio(...)` site; `addEventListener` only; error/buffering signals + `audioEnded` stream (`audio-resolver.ts`)
- **Build/test infra** — Angular 22.2 zoneless, TypeScript 6, Vitest unit tests (**17 specs / 3 files**), budgets enforced

## B. Half-done / incomplete ◐

> 7 of 13 items resolved during the G round; 6 remain open. (Resolved: 1 now-playing panel, 2 main content, 3 header, 7 `big` variant, 8 color inputs, 12 test coverage, 13 README.)

4. **Repeat modes** — only a restart button (seek-to-0); no off/all/one modes (`reproduction-controller.html` replay button).
5. **Mute** — volume icon is reactive but not clickable (`reproduction-controller.html` volume cluster).
6. **Decorative icon cluster** — mobile/mic/bars/headphones/maximize/expand and minus/plus-circle icons render but are plain `<i>`, no handlers/semantics (`reproduction-controller.html:19-20,99-113`).
9. **`alreadyPlayedMusicIndexes`** — maintained by shuffle, exposed but never consumed by UI (`playlist-player.ts`).
10. **Search UX (sidebar)** — no empty-result state, no result count, no persisted query (`library-section.ts`); playlist-view shares the same (filter works, empty state absent).
11. **Volume slider never disabled** even with no source loaded; transport disabled logic exists only for it (`reproduction-controller.html`).

## C. Excluded by owner scope + remaining open items

> **Excluded — not undone, never candidates (owner scope decision, see ⚠ above):** playlist CRUD / any API calls (POST/PUT/DELETE), likes & add-to-playlist, persistence (localStorage/DB/backend), queue reorder, liked-songs & recently-played history, media upload. The clone ships with read-only JSON data and an in-memory player. Full Spotify functionality is out of scope by definition.

**Remaining genuinely open (players/cosmetics only):**

- **Keyboard shortcuts** — space/arrows play-pause; none *(inferred)*
- **Media Session API integration** *(inferred)*
- **Accessibility pass** — global `:focus-visible` ring landed (E13); still no aria/roles/tabindex/keyboard handlers; interactive divs unreachable by keyboard *(code-verified, grep 0 hits)*
- **Error/buffering UI surfacing** — `audioError`/`audioBuffering` signals + recovery flow landed in AudioResolver (E8); no user-facing toast/spinner yet *(sig.-backed, UI pending — cosmetic)*
- **Responsive pass** — playlist-view gained `md:` header breakpoints + auto-fill grids; core scaffold stays fixed-width (`w-80/w-96`, `min-w-[500px]`); no true mobile pass *(partially started)*
- **Repeat/autoplay policy** / play-on-load options — if the owner wants repeat-as-off/all/one beyond the scope statement *(inferred)*

## D. Dead code — ✅ cleaned 2026-10-06 (historical proof)

| Item | Outcome |
|---|---|
| ~~`src/app/screens/main-screen/` (whole folder)~~ | ✅ deleted |
| ~~`<audio hidden>` in `app.html:2`~~ | ✅ deleted |
| ~~`RouterOutlet` dead~~ | → **obsolete**: routing went live (phase 1); outlet now renders routed views |
| ~~`CrudMusic.getAllMusic()`~~ | ✅ deleted (no callers) |
| ~~`Observable` import (`music-player.ts`)~~ | ✅ deleted |
| ~~`FormsModule` import (`reproduction-controller.ts`)~~ | ✅ deleted |
| ~~`'big'` variant~~ | → **obsolete**: implemented as the home-grid card (phase 2) |
| ~~`background` input (`LibraryCard`)~~ | ✅ deleted + `[background]` binder removed from the sidebar |
| ~~`tailwind.config.js` (0-byte)~~ | ✅ deleted |
| ~~README stale sections (Karma/e2e/CLI 20)~~ | ✅ README rewritten to current truth (Vitest, no e2e, ng 22) |

## E. Risks / bugs — ✅ all fixed + verified (historical proof)

> 14 original risks + 3 scrub-round bugs; verified by 17 Vitest specs + Playwright regressions (collision, shuffle cycle, silent scrub race, error recovery, cover fallback).

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
12. ~~**External CDN covers**~~ ✅ `d91a37b` — in-app fallback (dark block + music note) added on `error` (user-approved scope add).
13. ~~**Focus-visible absence**~~ ✅ `d91a37b` — global `:focus-visible` ring; `outline-none` utilities no longer eat keyboard focus.
14. **A11y pass remains open** (aria/roles/labels) — tracked for the accessibility work item; focus styling (13) landed as the first slice.
15. ~~**Scrubbing produced sound** while dragging~~ ✅ — `AudioResolver.beginScrub()/endScrub()`: drag pauses playback (remembering prior state), the current-time signal becomes preview-only (`timeupdate`-independent), release commits once and resumes.
16. ~~**Direct jump (no drag) needed several clicks**~~ ✅ — clicks with no value change (on/near the thumb) fired `pointerdown` but never `input`/`change`, leaving the player stuck in scrub-paused mode. Fix: commit also on `pointerup` + `pointercancel` (`slider-controller.html`), with `endScrub()` idempotent.
17. ~~**Click jump reverted to the pre-click time** (race)~~ ✅ — a stale in-flight `timeupdate` (queued before the scrub pause, fires during the human-speed press) overwrote the preview signal, so `endScrub` committed the OLD position. Three-layer fix: (a) `timeupdate` listener ignores events while scrubbing; (b) `dragEnded` carries the element's committed `valueAsNumber` from the DOM; (c) `endScrub(commitAt?)` seeks directly/synchronously (skipping when position unchanged) before resuming. Verified with 400ms holds at 3 positions + full-drag holds.

## F. Spotify UI parity assessment (fetched 2026-10-06, live web player)

> Reference: live `open.spotify.com` (a11y tree + screenshot of the real app, logged-in playlist view: `.playwright-mcp/spotify_app.png`). Scores: structure / behavior / visual fidelity vs real UI.
>
> **Scope caveat:** per the scope statement above, parity here is *visual* parity. Real Spotify elements that imply non-playback functionality (Premium/Support/Download/Sign up, create-playlist "+", filter chips, legal footer links, device/lyrics panels) are to be replicated visually and left non-functional. Playback-feeding elements (song rows, queue, transport) stay functional.

### Verdict table

> Rescored 2026-10-06 after the color-token round + scaffold-completion phases (all structural gaps closed: top bar, 3-panel shell, home grid, song-list view).

| Artifact | Structure | Behavior | Visual | Overall |
|---|---|---|---|---|
| `Scaffold` shell | 8/10 ↑ | n/a | 8/10 ↑ | complete skeleton (top bar, 3 panels, bottom bar) |
| `LibrarySection` | 8/10 ↑ | 8/10 ↑ | 6/10 | solid sidebar (search live); width/radius deltas open |
| `SourceCard` (ex-LibraryCard) | 8/10 | 8/10 | 8/10 ↑ | close (all 3 variants real) |
| `SearchButton` (ex-LibrarySearcher) | 8/10 ↑ | 8/10 | 6/10 | generalized, shared by sidebar + playlist view |
| `ReproductionController` | 8/10 | 7/10 ↑ | 7/10 ↑ | stateful play button; right-cluster icons decorative + replay-vs-repeat glyph open |
| `SliderController` + highlight | 9/10 | 9/10 | 9/10 | most accurate piece |
| `PlaylistView` (new) | 8/10 ↑ | 8/10 ↑ | 8/10 ↑ | matches official song-list layout; album/name data invented |
| `NowPlayingSection` (new) | 8/10 ↑ | 8/10 ↑ | 8/10 ↑ | official panel minus below-fold sections |
| `TopBar` (new) | 8/10 ↑ | 8/10 ↑ | 7/10 | chrome + functional nav; search pill/browse icon approximations |
| Global theme tokens | 9/10 | — | 9/10 | near match |

### Findings per artifact

1. **Shell (`scaffold`)** — closed: full-width black top bar (⋯ + back/forward — now functional (owner-approved), centered Home circle + search pill, bell/buddy/avatar); three rounded panels (Library / Main / Now-playing) on black with 8px gaps; full-width bottom player bar. Remaining deltas: panel radius 16px→8px, library width 500px vs 280px.
2. **Library panel** — real: heading + "+" create (visual-only per scope), filter-chips row + "Recents" sort; 280px width; collapses to icon-rail. Ours: toggle-to-collapse with variant swap, `min-w-[500px]`.
3. **`SourceCard`** — semantics closest to real playlist rows: 48px cover (ours 56px), bold title + gray `Playlist • Owner` subtitle, hover `#1f1f1f`, green playing title ✓. Real floating play button sits at the row's right edge (ours overlays the image — the *home-card* pattern).
4. **`SearchButton`** — expand pill + outside-click close, shared by sidebar + playlist action row; real sidebar pairs it with a "Recents" sort control under filter chips.
5. **`ReproductionController`** — layout matches; real center: shuffle, prev, **white filled circle play**, next, **repeat** (off/all/one) — ours has replay-to-zero and a transparent scaled icon; right cluster decorative. Cover 64px vs 56px (trivial).
6. **Slider** — best piece: 4px bar, hidden→white hover thumb, gradient fill with correct colors. Real grows to 6px on hover (one-line addition, open).
7. **Theme tokens** — resolved: `#1ED760` green, `#b3b3b3` muted, `#4d4d4d` track; remaining nuance: panel radius (16px vs 8px).

### Parity gaps, ranked (post-G)

1. **Repeat** control (off/all/one) replacing/augmenting replay — B4
2. White-circle play button styling (token bump already ✅)
3. Library "+" create + filter-chips/sort row + icon-rail collapse — visual-only per scope caveat
4. Row-hover play button at row-right (move overlay from image)
5. Panel radius 16px → 8px; slider 4px → 6px on hover
6. Below-fold now-playing sections (related videos / about the artist) — visual filler, deferred

## H. Historical log (proof of completed rounds)

- **Angular 20 → 22 upgrade** — `ng update` v20→v21→v22 to **22.2.1**, TS **6.0.3**; zoneless migration (zone.js removed), Karma → Vitest migration (`@angular/build:unit-test`, jsdom), SSR artifacts deleted; ~19% bundle drop. Full plan lived in `UPGRADE-PLAN.md` (removed post-merge; PR #1).
- **Bug-fix round** (branch `fix/bugs`, PR #2): 17 commits fixing all 14 §E risks — audio ownership via `addEventListener`, id-based queue index, iterative shuffle, silent-scrub infrastructure, typed Json resolution, cover fallbacks, DOM validity, focus rings. `AUDIT` commit trail retained in the §E table.
- **Scrub round** — three reported defects (sound while dragging, multi-click jump, stale-`timeupdate` revert race) fixed via `beginScrub()/endScrub(commitAt?)`; verified with 400ms-hold Playwright runs.
- **Color-token round** — `#1ed760` green, `--muted`/`--track` tokens, Tailwind v4 `(--x)` syntax sweep; verified computed styles.
- **Dead-code round** — §D deletions + README rewrite.
- **Scaffold-completion round (G)** — routing foundation, home grid (`big` source-cards), playlist song-list view, data fields (ffprobe-measured durations + invented album/dateAdded), `now-playing-section` panel, `top-bar` (+ live nav cluster), full verification sweep (0 console errors, budgets clean).
- **Restructure/taxonomy** — `screens/` routed-only; `layout/` shell group (scaffold, library-section, now-playing-section, top-bar); `ui/` generic widgets (SourceCard, slider-controller, search-button); `components/library/` removed as hollow.
- **Searcher generalization** — `search-button` shared by sidebar + playlist action-row; playlist play button stateful.
- **Docs round** — JSDoc/template-marker sweep applied codebase-wide; `HomeView` deferred-import dangling bug caught + fixed.

## Suggested build order (needs owner prioritization)

1. ~~Quick wins — risks + dead code~~ ✅ done (E + D)
2. ~~Shell + routing + center views + top bar~~ ✅ done (G/archived phases, see §H)
3. Next cosmetic candidates: repeat modes, mute, white-circle play styling, panel radius 8px, slider 6px hover
4. Then: shortcuts, media-session, a11y pass, error/buffering UI, responsive pass
