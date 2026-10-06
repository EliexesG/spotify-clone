# Codebase Audit — Spotify Clone (Angular 22)

> Snapshot: 2026-10-06, branch `dev` (`fb62cba`), post-Angular-22 upgrade.
> Purpose: reference for planning future work. Evidence verified by agent exploration; items marked *(inferred)* are reasoning, not code-verified.

> **⚠ Scope statement (owner decision, 2026-10-06):** the only *core real functionality* in this project is **playback** (play/pause/seek/volume/queue/shuffle). Everything else is *merely visual* — UI elements exist to look like Spotify, not to work. Examples: song lists/queue items are clickable (they feed playback), but buttons like **Premium** (and other top-bar/account chrome) are decorative only and will never do anything. Do not plan or build non-playback interactivity unless the owner explicitly asks.

## Summary

| Category | Count | Headline |
|---|---|---|
| ~~Dead code / unused~~ | 0 — ✅ **cleaned (D)** | all deletions landed; two entries became obsolete via G (routing, `big`) |
| Finished | 12 | Full transport, shuffle, queue auto-advance, library sidebar + search |
| Half-done / incomplete | 13 | Queue panel is a literal string; repeat modes; mute; header is text |
| Undone / not started | 11 | ~~Routing~~ ✅ (G1); CRUD playlists, likes, persistence, responsive, a11y |
| Risks / bugs | 17 (14 + 3 scrub round) | id-space collision; onended double-owner; scrub-commit race |

## A. Finished ✔

- **Library sidebar** — expand/collapse, conditional card variants (`library-section-container.html:5-16,29-35`)
- **Live search filter** — case-insensitive, trimmed; outside-click closes and clears (`library-section-container.ts:33-41`, `library-searcher.ts:33-43`)
- **Library cards** — hover highlight/dim, hover play/pause overlay, green "now playing" title (`library-card.html:15-21,29,37,43`, `library-card.ts:49-66`)
- **Card → queue load + play**, resume when clicking current queue (`library-card.ts:97-118`, `playlist-player.ts:137-152`)
- **Transport bar** — play/pause/next/prev/restart with disabled states (`reproduction-controller.html:42-81`)
- **Shuffle** — toggle + green indicator + already-played bookkeeping (`reproduction-controller.html:28-41`, `playlist-player.ts:197-199`)
- **Seek + duration + progress-fill slider** with hover thumb; **silent scrubbing** (drag = pause + preview, release = commit + resume) (`reproduction-controller.html:83-94`, `audio-resolver.ts beginScrub/endScrub`)
- **Volume** — slider + reactive icon off/down/up (`reproduction-controller.html:103-111`)
- **Auto-advance on song end** (`playlist-player.ts:63-71`)
- **Initial preload** of playlist `'1'` first song (`scaffold.ts:20-22`)
- **Signal-based audio plumbing** — single `new Audio(...)` site (`audio-resolver.ts:17,149-155`)
- **Build/test infra** — Angular 22.2 zoneless, Vitest unit tests (**17 specs / 3 files**), budgets enforced

## B. Half-done / incomplete ◐

1. ~~**Reproduction List panel** — literal string header in `scaffold.html:15`~~ → ✅ **resolved (G Phase 5)**: `now-playing-section` panel (playlist header name, big current cover, title/artist, empty state).
2. ~~**Main content area** — stub `h1` + empty `<router-outlet>`~~ → ✅ **resolved**: center is routed (G Phases 1–2); `MainScreen` deleted (D).
3. **Header** — literal "Header" text; no nav, logo, user menu (`scaffold.html:3`).
4. **Repeat modes** — only a restart button (seek-to-0); no off/all/one modes (`reproduction-controller.html:75-81`).
5. **Mute** — volume icon is reactive but not clickable (`reproduction-controller.html:103`).
6. **Decorative icon cluster** — mobile/mic/bars/headphones/maximize/expand and minus/plus-circle icons render but are plain `<i>`, no handlers/semantics (`reproduction-controller.html:19-20,99-113`).
7. ~~**`big` card variant** — declared but template is an empty `<div>` stub~~ → ✅ **implemented (Phase 2)**: home-grid card with large cover, hover-revealed floating green play/pause button, title/subtitle; grid path in `HomeView`.
8. ~~**Unused colorInput slots**~~ ✅ `d91a37b`+color-token round — `colorLeft/colorRight` now bound via `slider-controller.html` (`[appHighlightSliderColorLeft/Right]`); `background` input on `LibraryCard` still unbound (small cleanup).
9. **`alreadyPlayedMusicIndexes`** — maintained by shuffle, exposed but never consumed by UI (`playlist-player.ts:46-48`).
10. **Search UX** — no empty-result state, no result count, no persisted query (`library-section-container.ts:33-41`).
11. **Volume slider never disabled** even with no source loaded; transport disabled logic exists only for it (`reproduction-controller.html:104-111`).
12. ~~**Test suite** — shallow~~ → superseded: service logic now covered (see Round 2 + `audio-resolver.spec.ts`); UI component coverage still missing.
13. **README** — stale (Karma, e2e, CLI 20.1.4); `AGENTS.md` is accurate but README is not.

## C. Undone ✗ (*inferred* unless noted)

- ~~**Routing/navigation** — `routes` empty; no playlist-detail/home screens~~ → ✅ **started/done (G Phase 1):** real routes + view shells + sidebar navigation live
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

## D. Dead code — ~~safe deletions~~ ✅ cleaned 2026-10-06

| Item | Outcome |
|---|---|
| ~~`src/app/screens/main-screen/` (whole folder)~~ | ✅ deleted |
| ~~`<audio hidden>` in `app.html:2`~~ | ✅ deleted |
| ~~`RouterOutlet` dead~~ | → **obsolete**: routing went live (section G Phase 1); outlet now renders routed views |
| ~~`CrudMusic.getAllMusic()`~~ | ✅ deleted (no callers) |
| ~~`Observable` import (`music-player.ts`)~~ | ✅ deleted |
| ~~`FormsModule` import (`reproduction-controller.ts`)~~ | ✅ deleted |
| ~~`'big'` variant~~ | → **obsolete**: implemented as the home-grid card (Phase 2) |
| ~~`background` input (`LibraryCard`)~~ | ✅ deleted + `[background]` binder removed from `library-section-container.html` |
| ~~`tailwind.config.js` (0-byte)~~ | ✅ deleted |
| ~~README stale sections (Karma/e2e/CLI 20)~~ | ✅ README rewritten to current truth (Vitest, no e2e, ng 22) |

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

### Round 2 — scrubbing behavior (2026-10-06, on `dev`, owner commits)

New feature-behavior request ("no sound while moving the seek bar") surfaced three sequential defects; all fixed together (uncommitted in working tree, owner reviews/commits):

15. ~~**Scrubbing produced sound** while dragging~~ ✅ — `AudioResolver.beginScrub()/endScrub()`: drag pauses playback (remembering prior state), the current-time signal becomes preview-only (`timeupdate`-independent), release commits once and resumes. `changeAudioCurrentTime` guard in the seek effect.
16. ~~**Direct jump (no drag) needed several clicks**~~ ✅ — clicks with no value change (on/near the thumb) fired `pointerdown` but never `input`/`change`, leaving the player stuck in scrub-paused mode. Fix: commit also on `pointerup` + `pointercancel` (`slider-controller.html`), with `endScrub()` idempotent.
17. ~~**Click jump reverted to the pre-click time** (race)~~ ✅ — a stale in-flight `timeupdate` (queued before the scrub pause, fires during the human-speed press) overwrote the preview signal, so `endScrub` committed the OLD position. Three-layer fix: (a) `timeupdate` listener ignores events while scrubbing; (b) `dragEnded` now carries the element's committed `valueAsNumber` from the DOM (`slider-controller commit()`) — commit independent of preview signal; (c) `endScrub(commitAt?)` seeks directly/synchronously (skipping when position unchanged — no seek-to-T0 churn) before resuming. Verified in-browser with 400ms holds (the race timing) at 3 positions + full-drag holds: preview stable, first-press commitment, correct resume every time. 17/17 tests incl. `audio-resolver.spec.ts` race regressions.

### Color-token round (2026-10-06, same working tree) — ✅ COMPLETE

> Styling-only round (no behavior changes). All items landed and verified in-browser (computed styles: `#1ed760`, `#b3b3b3`, `#4d4d4d`, `#121212`); build + 17/17 tests green. Not a bug fix — listed here for chronology only.

- ✅ `--primary` `#1db954` → **`#1ed760`** (modern Spotify green); new tokens `--muted` (#b3b3b3) and `--track` (#4d4d4d) in `src/styles.css`
- ✅ Subtitle grays moved to `text-(--muted)` (`library-card`, `reproduction-controller`); slider track `gray` → `var(--track)` (`slider-controller.scss`); `colorRight` defaults → `var(--track)` (`slider-controller.ts`, `highlight-slider.ts`)
- ✅ Legacy `bg-[var(--x)]`/`text-[var(--x)]` migrated to Tailwind v4 `(--x)` form across 5 templates/strings — none left in the codebase
- ✅ `AGENTS.md` updated: theming section (tokens + change-colors-only-there rule), `npm run dev` rename, specs list, **never-kill-owner-dev-server rule**

## F. Spotify UI parity assessment (fetched 2026-10-06, live web player)

> Reference: live `open.spotify.com` (a11y tree + screenshot, logged-out shell — full layout skeleton visible). Scores: structure / behavior / visual fidelity vs real UI.
>
> **Scope caveat:** per the scope statement above, parity here is *visual* parity. Real Spotify elements that imply non-playback functionality (Premium/Support/Download/Sign up, create-playlist "+", filter chips, legal footer links, device/lyrics panels) are to be replicated visually and left non-functional. Playback-feeding elements (song rows, queue, transport) stay functional.

### Verdict table

> Rescored 2026-10-06 after the color-token round (green `#1ed760`, `--muted` subtitles, `--track` slider). Structure scores unchanged (layout untouched).

| Artifact | Structure | Behavior | Visual | Overall |
|---|---|---|---|---|
| `Scaffold` shell | 5/10 | n/a | 6/10 | half-done vs real |
| `LibrarySectionContainer` | 7/10 | 7/10 | 6/10 | good skeleton |
| `LibraryCard` | 8/10 | 8/10 | 8/10 ↑ | close |
| `LibrarySearcher` | 7/10 | 8/10 | 6/10 | good mini version |
| `ReproductionController` | 8/10 | 6/10 | 7/10 ↑ | close, wrong glyphs |
| `SliderController` + highlight | 9/10 | 9/10 | 9/10 ↑ | most accurate piece |
| Global theme tokens | 9/10 ↑ | — | 9/10 ↑ | near match |

### Findings per artifact

1. **Shell (`scaffold.html`)** — biggest structural gap. Real: global black top bar (logo, circular Home, pill search "What do you want to play?", Premium/Support/Download/Install/Sign up/Login) spanning everything; below it **three** rounded `#121212` panels on black with 8px gaps (Library / Main / Now-playing panel); full-width bottom player bar. Ours: header is the literal `"Header"` string inside the main column, right panel is the literal `"Reproduction List"`, panels use `rounded-2xl` (16px) vs Spotify's 8px. The `p-2` gap + black background are correct. Geometry ~70% there; top bar and third panel missing as components.
2. **Library panel** — right idea, missing Spotify's second row. Real: heading + green "+" create button (the `pi-bars` burger on real Spotify toggles the resize rail, not collapse); filter-chips row (Playlists/Artists/Albums) above a search-icon + "Recents" sort row; 280px resizable width; legal-links footer; collapse-to-icon-rail. Ours: toggle-to-collapse with variant swap (similar spirit, different mechanic), searcher inline; `min-w-[500px]` vs real 280px.
3. **`LibraryCard`** — semantics closest to real playlist rows: 48px cover (ours 56px), bold title + gray `Playlist • Owner` subtitle (same wording pattern), hover `#1f1f1f`, green playing title ✓. Differences: real floating play button sits at the row's right edge (ours overlays the image — that's Spotify's *home-card* pattern), and the playing row shows a green volume icon.
4. **`LibrarySearcher`** — good micro-interaction (expand pill, outside-click close) but that pattern belongs to Spotify's top-bar search, not the sidebar; real sidebar pairs a search icon with a "Recents" sort control under filter chips.
5. **`ReproductionController`** — layout matches (left cover/title/add-like, center controls + progress, right utilities). Real center: shuffle, prev, **white filled circle play**, next, **repeat** (off/all/one) — ours has replay-to-zero and a transparent scaled icon. Real right cluster is fully functional (queue, device, lyrics, mute, volume, fullscreen) — ours renders 6 decorative `<i>`s. Cover 64px vs real 56px (trivial).
6. **Slider** — best piece: 4px bar, hidden→white hover thumb, gradient fill all match — now with correct colors (`#1ed760` fill on `#4d4d4d` track). Real grows to 6px on hover (one-line addition, open).
7. **Theme tokens** — `#121212` ✓, hover `#1f1f1f` ✓, black base ✓, 8px gaps ✓. ~~Nuances:~~ **Resolved 2026-10-06:** brand green is now `#1ED760`, subtitle gray `#b3b3b3` (`--muted`), slider track `#4d4d4d` (`--track`); only remaining nuance is panel radius (ours 16px, real 8px) — tracked in gap #7.

### Parity gaps, ranked

1. Global **top bar** component (literal `"Header"` today) — also feeds B3
2. **Repeat** control (off/all/one) replacing/augmenting replay — B4
3. Right **Now-playing panel** (literal `"Reproduction List"` today) — B1
4. ~~White-circle play button styling + `#1ED760` token bump~~ → **token bump ✅ done** (color round); white-circle play styling still open
5. Library "+" create + filter-chips/sort row; icon-rail collapse — pairs with C (playlist CRUD); visual-only per scope caveat
6. Row-hover play button at row-right (move overlay from image)
7. Panel radius 16px → 8px; ~~subtitle gray `#b3b3b3`~~ (**✅ done** — `--muted` token); slider 4px → 6px on hover (open)

## G. Scaffold completion plan (decided 2026-10-06 — in progress)

Owner decisions: **Angular Router** for view switching · right panel = **Now-playing view** (official match) · **extend songs.json** (`album`/`dateAdded`) · **top bar included** in this round. Reference: real-app screenshot (`.playwright-mcp/spotify_app.png`).

| Phase | Scope | Status |
|---|---|---|
| 1 | **Routing foundation** — routes (`''` home grid, `playlist/:id` detail, `**`→`''`), empty view shells wired in the center outlet, sidebar `LibraryCard` navigates (queue load stays) | ✅ done — verified live on the owner's running dev server: `/` renders `app-home-view`, sidebar row click → `/playlist/:id` + queue load, deep links work, 17/17 tests (app.spec now drives the Router), center `h1` stub removed |
| 2 | **Home grid view** — `big`-variant `LibraryCard` grid (fills B7 stub), grid card click → navigate (no autoplay; overlay button plays), empty state | ✅ done — real `big` template (large cover + floating green play on hover, pause when playing), body click navigates without autoplay, same-playlist guard keeps playback undisturbed; new tokens `--elevated`/`--hover-elevated`; grid verified live. **Behavior refined (owner):** overlay button only *plays* (stays on the grid, like the left-menu cover button — navigation removed); body click *enters* without autoplay |
| 3 | **Playlist view (song list)** — gradient header (big cover/"Public Playlist"/title/owner/counts), green play button = only interactive control (plays queue), shuffle/others visual-only; track table `# \| Title \| Album \| Date added \| ⏱`, rows clickable → play track, green current-track title | ✅ done — verified live: gradient header w/ blurred cover backdrop, header green play restarts queue (row 1), track rows play from the clicked track, current row (# + title) renders in `#1ed760`, real `durationSeconds` (ffprobe-measured) shown mm:ss, missing album/dateAdded render `—`, unknown id → "Playlist not found" + back link |
| 4 | **Data model** — `MusicSource.album?`/`dateAdded?` optional fields + values for the 5 tracks | ◐ half-done — `album?`/`dateAdded?`/`durationSeconds?` added to the interface; **real durations** measured with ffprobe and written into `songs.json` (match the displayed 2:17/0:56 times); `album`/`dateAdded` left as empty strings for the owner to fill (table renders `—` meanwhile) |
| 5 | **Right panel → `NowPlayingSection`** — header = current playlist name ("Your Queue" fallback), big current-track cover (fallback pattern reuse), title+artist; empty state when nothing loaded; related-videos/about-artist sections deferred | ✅ done — `components/layout/now-playing-section/` replaces the literal `"Reproduction List"` (B1 closed); verified live: header + big cover + title/artist follow the loaded playlist/track, filtered `w-80` panel; empty state branch present ("Find something to play", reachable only when no source loads) |
| 6 | **Top bar (visual-only chrome)** — full-width black bar: ⋯ + back/forward (dead), Home circle + search pill (dead), bell/buddy/avatar (dead); replaces literal `"Header"` (B3) | pending |
| 7 | **Verification** — build, tests, Playwright pass over grid→detail→row-play→right-panel flows; budgets; AUDIT B1/B2/B3/B7/C-routing/F-score updates | pending |

Notes: new view components live in `screens/` (`home-view`, `playlist-view`), keep `ChangeDetectionStrategy.Eager` + signal patterns; `MainScreen` stub stays scheduled for deletion (D) — new views replace it. Big-grid-card click navigates without autoplay (official behavior; sidebar card keeps navigate+play).

**Restructure (2026-10-06):** `screens/` now holds routed pages only — `Scaffold` moved to **`components/layout/scaffold/`**; `library-card` → **`components/ui/source-card/`** (renamed `SourceCard`/`app-source-card`, model `SourceCardVariant` — music+playlist agnostic); `slider-controller` → **`components/ui/slider-controller/`**; `library-section/` group → **`components/library/`** with the container renamed to **`library-section`** (`LibrarySection`, selector `app-library-section`). All references swept; build + 17/17 tests + live navigation verified.

**Taxonomy completion (owner request, same day):** `library-section` joined the shell group — **`components/layout/` = full-panel shell pieces composed by `Scaffold`** (now: `scaffold`, `library-section`; upcoming: `now-playing-view`, `top-bar`); the now-empty `components/library/` group was removed (domain groups reappear only when real content exists); `library-section.ts` internal import depths unchanged, `scaffold.ts` uses the sibling path. Verified: build, 17/17 tests, sidebar nav + grid live.

**Pre-build SourceCard-vs-image comparison notes (owner request, before Phase 3):** our `big` grid card already matched the official home card pattern closely (elevated `#181818` surface, image-first layout with inner padding, bold title + gray subtitle **inside** the card, ~8px radius, floating green play button on hover bottom-right over the cover). Confirmed deltas, all minor: official title size ≈ ours (`text-base`); official radius 8px (ours `rounded-md`/6px — close enough); official home sections carry a section header + "Show all" link (ours has one section, "Show all" skipped as decorative) — no placement changes to `SourceCard` were needed for Phase 3; the official **detail-view** visuals (table columns) were transplanted into `PlaylistView`, leaving `SourceCard` as the shared, music/playlist-agnostic card.

**Searcher generalization (owner request, 2026-10-06):** `library-searcher` → **`components/ui/search-button/`** (`SearchButton`/`app-search-button`, `placeholder` input added — default "What do you want to play?"); used by `library-section` ("Search in your library") unchanged and now by `PlaylistView`'s action row ("Search in playlist"), where it feeds a `trackFilter` signal that filters the song table live (owner-approved interactivity; playback untouched). Header green play button made stateful (owner request): toggles play/pause via the queue-resume path instead of always restarting.

## Suggested build order (needs owner prioritization)

1. ~~Quick wins — risks #1–#14 + dead code (D)~~ ✅ **all done (E + D)**
2. ~~Complete the shell — main content + routing~~ → ✅ **in progress (G Phases 1–3 done, 4 half-done); remaining G: Now-playing panel, top bar**
3. **Next: G Phase 5 — Now-playing panel**, then Phase 6 top bar
4. Repeat modes, mute, functional side icons (like/add)
5. CRUD playlists + persistence (localStorage or backend)
6. Responsive + accessibility pass
