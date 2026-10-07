# Codebase Audit — Spotify Clone (Angular 22)

> Snapshot: 2026-10-06, branch `dev` (`60de758`+), Angular 22.2, TypeScript 6.0, zoneless, Vitest — single-app clone, no backend.
> Purpose: reference for current state + future work; history is condensed in section **H** (items marked *(inferred)* are reasoning, not code-verified).

> **⚠ Scope statement (owner decision, 2026-10-06):** this is **only a visual clone with a minimal music implementation** — the single core real functionality is **playback** (play/pause/seek/volume/queue/shuffle). **Nothing else is real, and nothing will be**: no CRUD of any kind (no POST/PUT/DELETE, no API calls, no backend, no persistence — the JSON files are read-only data), no full Spotify functionality. UI exists to look like Spotify: song lists/queue are clickable only because they feed playback; buttons like **Premium** (and other top-bar/account chrome) are decorative and will never do anything. Do not plan or build non-playback interactivity unless the owner explicitly asks. **Owner-approved exception (2026-10-06):** the top-bar navigation cluster is functional — home button → `/`, back/forward arrows → router visit history.

## Summary

| Category | Count | Headline |
|---|---|---|
| Dead code / unused | 0 — ✅ **cleaned (D)** | verified deletions; two entries became obsolete via G (routing, `big`) |
| Finished | 19 | Playback stack (transport/shuffle/repeat/auto-advance/silent scrub/mute), library sidebar + search + empty-states, routing + home grid + playlist song-list view, now-playing panel + next-in-queue, top bar w/ live nav cluster + shortcuts trigger, keyboard shortcuts, Media Session, error/buffering toast, shortcuts overlay |
| Half-done / incomplete | 0 open (13 of 13 resolved) | all §B items resolved |
| Excluded by owner scope | — | **no CRUD/API/persistence/likes/queue-reorder** — visual clone with minimal real playback only (see ⚠) |
| Remaining open (non-scope) | 1 | README interactions map |
| Risks / bugs | 17 (14 + 3 scrub round) | all ✅ fixed + verified |

## A. Finished ✔

- **Library sidebar (`LibrarySection`)** — expand/collapse, conditional card variants (`library-section.html:5-16,29-35`)
- **Live search filter** — case-insensitive, trimmed; outside-click closes and clears; shared `SearchButton` w/ site-configurable placeholder (`library-section.ts:33-41`, `search-button.ts`)
- **Source cards (`SourceCard`)** — music/playlist-agnostic; hover highlight/dim, hover play/pause overlay, green "now playing" title, image-fallback placeholder, drag/hover state via signals (`source-card.ts:49-66`)
- **Card → queue load + play**, resume when clicking current queue; body click navigates without autoplay (`source-card.ts:97-121`)
- **Routing + center views** — `''` home grid ⇄ `playlist/:id` song-list detail; wildcard redirect; deep links (`app.routes.ts`, `home-view`, `playlist-view`)
- **Home grid** — responsive `big`-card grid + empty state (`home-view.html`)
- **Playlist song-list view** — gradient header, green play button (stateful play/pause, owner-refined), track **semantic table** (`<table>` + colgroup widths, sticky thead, title+artist cells, per-row play buttons — owner-corrected from a misaligned grid/button hybrid), clickable rows (whole-row mouse click + title-cell keyboard button), search filter (`playlist-view.*`)
- **Now-playing panel (`NowPlayingSection`)** — playlist-name header + big current cover (fallback) + title/artist + empty state (`now-playing-section.*`)
- **Top bar (`TopBar`)** — visual chrome + owner-approved live nav cluster (home → `/`, back/forward via `Location`) (`top-bar.*`)
- **Transport bar** — play/pause/next/prev/restart with disabled states (`reproduction-controller.html:42-81`)
- **Shuffle** — toggle + green indicator + already-played bookkeeping (`reproduction-controller.html:28-41`, `playlist-player.ts:197-199`)
- **Seek + duration + progress-fill slider** with hover thumb; **silent scrubbing** (drag = pause + preview, release = commit + resume) (`audio-resolver.ts beginScrub/endScrub`)
- **Volume** — slider + reactive icon off/down/up (`reproduction-controller.html:103-111`)
- **Auto-advance on song end** (`playlist-player.ts:63-71`)
- **Initial preload** of the default playlist's first song (`scaffold.ts:20-22`, `CrudPlaylist.getDefaultPlaylist()`)
- **Signal-based audio plumbing** — single `new Audio(...)` site; `addEventListener` only; error/buffering signals + `audioEnded` stream (`audio-resolver.ts`)
- **Repeat modes** — off/all/one cycling (`PlaylistPlayer.toggleRepeat`), auto-advance honors the policy (`one` → restart, `off` + queue end → stop, `all`/manual → wrap); transport repeat button w/ official active styling (green dot / "1" dot) (`playlist-player.ts`, `reproduction-controller.html`)
- **Mute** — clickable volume icon + `MusicPlayer.toggleMute()` (last-audible restore), volume slider/icon disabled with no source (`music-player.ts`, `reproduction-controller.html`)
- **Keyboard shortcuts** — `services/keyboard-shortcuts.ts` (instantiated by `Scaffold`): Space play/pause, ←/→ seek ±5s, ↑/↓ volume ±0.1, M mute, S shuffle, R repeat, N/P next/prev; text-entry targets always yield; seek/volume clamped. 5 specs; live-verified (incl. typing-yield) (`keyboard-shortcuts.ts`)
- **Media Session API** — `PlaylistPlayer.setupMediaSession()` (feature-gated): per-track metadata, `play/pause/previoustrack/nexttrack` registered once (no overwrite rule), `playbackState` mirrors `isMusicPlaying`; OS media keys/lock-screen art (`playlist-player.ts`)
- **Error/buffering surface** — `components/ui/playback-feedback/` (rendered by `Scaffold`): fixed `role="status"` toast over `audioError` (persistent until next canplay/source change) + buffer-spinner pill for stalled-not-playing (`playback-feedback.*`)
- **Shortcuts overlay** — `components/ui/shortcuts-overlay/` official-style centered modal (keycap chips, 4 groups / 12 rows, `shortcuts-overlay.model.ts` = display source of truth); opens with `?` or the top-bar "?" trigger, closes with Escape/backdrop, playback shortcuts suspended while open
- **Search empty-states** — `@empty` "Couldn't find "X"" in library sidebar + playlist track loop (`library-section.html`, `playlist-view.html`)
- **Shared cover component (`ImageFallback`)** — single error-fallback owner for all covers (sidebar rows, grid, transport bar, now-playing panel, playlist header + table rows); consumers only size it (`image-fallback.*`)
- **Responsive pass** — official-parity desktop floor: research measured the real web player has NO breakpoints (fixed ~810px layout, horizontal scroll below, no mobile refit); `scaffold` shell carries `min-w-[810px]`, transport left/right sections shrink with `min-w-0` + truncate, far-right decorative icons hide below `xl:`, home grid auto-fill + playlist `md:` header breakpoints unchanged (`scaffold.html`, `reproduction-controller.html`)
- **Panel space arbitration** — official small-window model decoded from the owner's reference shots: center never shrinks (`min-w-100`), library/now-playing share the same width (`w-80` each), now playing collapses to a sliver with reopen chevron (closable X), and below `BOTH_FIT_WIDTH` = 1080px exactly one panel is open — opening one collapses the other, narrowing auto-collapses the library to rail; both panels own their collapsed presentation via the identical `open = model(true)` + `toggleOpen()` contract, the shell only arbitrates (`scaffold.*`, `library-section.*`, `now-playing-section.*`)
- **Accessibility pass** ✅ — native controls everywhere: cover toggles + floating play = `<button>`, card/row compositions = `role="button" tabindex="0"` + Enter/Space handlers (nested-button pattern fixed via `role="button"` composite + keydown stopPropagation to prevent double-activation), library header + track rows = `<button>`; every interactive element labeled (icon-only buttons incl. transport/top-bar get `aria-label`/`title`); `aria-live="polite"` on transport title (track-change announcement) and playback feedback; sliders expose `label` input → native `aria-label`; focus ring extended to `[role="button"]`. Verified live: full Tab walk (labeled focus stops), Enter on card navigates, Space on cover toggles play without navigating, zero unlabeled interactives, hover highlight + cover overlay intact. **Scope of closure: structural/keyboard/a11y-semantics; SR (NVDA/VoiceOver) session audit + palette-contrast audit excluded (future candidates, not owner-requested)** (styles.css, source-card.*, library-section.html, playlist-view.html, reproduction-controller.html, slider-controller.*)
- **Build/test infra** — Angular 22.2 zoneless, TypeScript 6, Vitest unit tests (**27 specs / 3 files**), budgets enforced

## B. Half-done / incomplete ◐

> **All 13 items resolved** (G round: 1 now-playing panel, 2 main content, 3 header, 7 `big` variant, 8 color inputs, 12 test coverage, 13 README; volume round: 5 mute, 11 volume-disabled; repeat round: 4 repeat modes; parity round: 10 search empty-states, 6 decorative cluster semantics; cleanup round: 9 `alreadyPlayedMusicIndexes`).

## C. Excluded by owner scope + remaining open items

> **Excluded — not undone, never candidates (owner scope decision, see ⚠ above):** playlist CRUD / any API calls (POST/PUT/DELETE), likes & add-to-playlist, persistence (localStorage/DB/backend), queue reorder, liked-songs & recently-played history, media upload. The clone ships with read-only JSON data and an in-memory player. Full Spotify functionality is out of scope by definition.

**Remaining genuinely open (players/cosmetics only):**

- **Interactions map (README)** — every real interaction (mouse/keyboard/OS-media-session) documented in README.md at the end; owner-requested format *(pending — doc-only)*

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
- **Image-fallback round (owner request)** — the 4 hand-rolled error patterns (SourceCard ×3, ReproductionController, NowPlayingSection, playlist-view crude `hidden`) consolidated into `components/ui/image-fallback/`; consumers drop their own signals/effects; verified: 6 covers normal + all placeholders on blocked CDN + no stale fallback on src change; AGENTS gained the "never hand-roll (error)" rule.
- **Mute round (owner request, B5+B11)** — `MusicPlayer.toggleMute()` stores the last audible volume and restores it on un-mute; the volume icon became a real button bound to it and the volume slider gained `[disabled]="disableReproductionControls()"` (mirrors the seek bar; the bootstrap default source means it only engages after a source is cleared). Verified live: 0.5→0→0.5 with icon off/up and slider sync.
- **Repeat round (owner request, B4)** — `PlaylistPlayer` gains `RepeatMode` (`'off' | 'all' | 'one'`) + cycling `toggleRepeat()`; the `audioEnded` auto-advance honors it (`one` → restart, `off` + queue ended → stop instead of wrap, `all`/manual → wrap as before); the transport restart button became the repeat button with Spotify's active styling (green icon + dot for `all`, green "1" dot for `one`); 5 new deterministic specs (22/22) with the UI cycle live-verified.
- **Parity round (owner request, B10+B6+B9)** — search empty-states land in both views (`@empty` + "Couldn't find "X"", live-verified with 0 cards); the "Next in queue" compact preview lands in `NowPlayingSection` (official app parity, owner-approved): `PlaylistPlayer.nextMusic` computed exposes the sequential next under non-shuffle, the row hides under shuffle/at queue end (random can't be predicted), and it reuses the generic `SourceCard` (`open()` gained the music path — jump-and-play — its first real music consumer, so the hand-rolled duplicate row was deleted instead of grown); decorative transport icons gained honest chrome semantics (`role="img"` + `aria-label` + `title`, still no actions by scope); `alreadyPlayedMusicIndexes` public getter removed, add/remove helpers privatized (internal shuffle bookkeeping only). Live-verified all four surfaces; build green; 22/22.
- **Shortcuts/media-session/feedback round (owner request, 3 §C items)** — `KeyboardShortcuts` service (Scaffold-instantiated; text inputs yield; clamped seek/volume), Media Session mirrored from `PlaylistPlayer` (feature-gated, handler-once rule, per-track metadata), `playback-feedback` toast rendered by `Scaffold`; 5 new specs (27/27) + the full key map live-verified, including blocked-route error pill.
- **Shortcuts-overlay round (owner request, official parity research)** — the official desktop app exposes its binding list through a centered dark modal opened with `Ctrl/Cmd + /` (Shift+`\`/`?` variants, support-article verified); ours: `components/ui/shortcuts-overlay/` (`role="dialog"`, keycap chips styled with tokens, 4 groups / 12 rows mirroring the real map, single display source of truth in `shortcuts-overlay.model.ts`); opens with `?` or the new top-bar "?" trigger button (owner-requested discoverability hint, functional like home/nav), closes with Escape or backdrop click; playback shortcuts suspend while open. Live-verified all five paths (button, `?`, space-suspension, Esc, backdrop).
- **Responsive round (owner request, official-parity research)** — live-measured the official web player at 7 widths: no breakpoints anywhere; fixed ~810px desktop layout with horizontal scroll below; library/now-playing default widths are fixed, collapse-to-rail is a manual desktop-app toggle. Ours adopts the same model: `min-w-[810px]` shell floor replacing `min-w-[500px]`, transport sections made shrink-safe (`min-w-0` + truncated track title/artist), decorative right-cluster icons `hidden xl:block`. Applied exactly the agreed changes only (owner testing manually).
- **Panel-arbitration round (owner request, references `spotify_app_small(_2).png`)** — decoded the official small-window model against the first (wrong) pane-flex attempt: center never shrinks; library and now playing share the same width; NP closes to a sliver with reopen chevron; below the 1080px both-fit threshold exactly one panel is open (opening one collapses the other, narrowing auto-collapses the library to rail). First wiring was inconsistent/split (state in shell markup for NP, internal for library) — unified per owner correction to the single panel contract `open = model(true)` + `toggleOpen()` in both sections; shell keeps only `width`/`bothFit`/two handlers/effect. Owner-caught bugs fixed: NP disappearing totally after close (outer `@if` without `@else` swallowed the sliver) and dead arbitration (bindings bypassing the handler methods). Full live state-machine sweep verified (t1–t7).
- **A11y round (owner request)** — structural accessibility pass as scoped: native/`role="button"` controls (Enter/Space with stopPropagation guarding the nested cover buttons — the sweep itself caught a Space double-activation bug), labels on every interactive element, `aria-live` track announcement, slider `label` inputs, focus ring extended to `[role="button"]`; zero unlabeled interactives live-verified; item closed with explicit "SR/contrast audit excluded" scope note. **Owner follow-up:** the grid/button row hybrid was misaligned; rebuilt as a full semantic `<table>` (colgroup-aligned columns verified pixel-exact vs thead, sticky header with real token bg, artist line added under title per official format, `@empty` → `colspan=5` row; keyboard play via native title-cell button, mouse via whole-row click).

## Suggested build order (needs owner prioritization)

1. ~~Quick wins — risks + dead code~~ ✅ done (E + D)
2. ~~Shell + routing + center views + top bar~~ ✅ done (G/archived phases, see §H)
3. Next cosmetic candidates: repeat modes, mute, white-circle play styling, panel radius 8px, slider 6px hover
4. Then: shortcuts, media-session, a11y pass, error/buffering UI, responsive pass
