# Angular 20 → 22 Upgrade Plan

Decisions: migrate to **zoneless** and **Vitest** during this upgrade.
Node v26.5.0 (supported). TypeScript 5.8 → 6.0. Work branch off `dev`.

- [Phase 0 — Prep](#phase-0--prep)
- [Phase 1 — v20 → v21](#phase-1--v20--v21)
- [Phase 2 — Zoneless migration](#phase-2--zoneless-migration)
- [Phase 3 — v21 → v22](#phase-3--v21--v22)
- [Phase 4 — Karma → Vitest](#phase-4--karma--vitest)
- [Phase 5 — Post-migration review](#phase-5--post-migration-review)
- [Phase 6 — Validation & finish](#phase-6--validation--finish)
- [Known breaking points (verified against this codebase)](#known-breaking-points)

## Phase 0 — Prep

- [x] Commit/stash all local work; branch off `dev`: `git checkout -b chore/angular-22-upgrade dev`
- [x] `npm install` and confirm node_modules is fresh
- [x] Baseline verification: `ng build` (record bundle size vs budgets: initial 500kB warn/1MB error; component styles 4kB warn/8kB error)
- [x] Baseline tests: `ng test --watch=false --browsers=ChromeHeadless`
- [x] Analyze update plan: `npx ng update` (list only)

> **Baseline (2026-10-06, Angular 20.3)**: `ng build` OK — initial total **382.85 kB raw / 104.11 kB transfer** (no budget warnings). Tests: 2/2 green (fixed stale title expectation in `app.spec.ts`: `'Hello, spotify-clone'` → `'Welcome to the Scaffold Page'`). `ng update` analysis: `@angular/cli` 20.3.38 → 21.2.9, `@angular/core` 20.3.33 → 21.2.9 available.

## Phase 1 — v20 → v21

- [x] `npx ng update @angular/cli@21 @angular/core@21`
  - Auto-updates `@angular/build`, `@angular/ssr` and peer deps to 21 (requires TS ≥5.9)
- [x] Review the migration diff only; revert nothing blindly
- [x] Watch for the known quirk: migration may inject `provideZoneChangeDetection()` into `main.server.ts` bootstrap (angular/angular#65408) — remove it (we go zoneless in Phase 2) → **occurred as predicted; removed**
- [x] `ng build` — fix compile errors; run tests once (initial 387.97 kB raw / 105.02 kB transfer; tests 2/2 green)
- ~~Bump TypeScript now (step-stone for TS 6 in v22): `npm i -D typescript@^6.0`~~ → **attempted (6.0.3) but reverted to `~5.9.3`: v21 `@angular/build` peer range is `>=5.9 <6.0` (only compiler-cli accepts 6.x). TS 6 bump moves to Phase 3.**

## Phase 2 — Zoneless migration

- [x] Remove `provideZoneChangeDetection` from `src/app/app.config.ts`
- [x] Remove `zone.js` and `zone.js/testing` from `angular.json` polyfills (build and test targets)
- [x] `npm uninstall zone.js`
- [x] Verify zoneless compatibility (already confirmed, re-check after edit):
  - All template state is signals read in templates (audioPlayer services, `filteredPlaylists`, etc.)
  - `[(ngModel)]` (+ FormsModule) schedules CD in zoneless v21+ — ok
  - `@HostListener('document:click')` triggers CD for bound listeners — ok
  - `new Audio()` listeners in `AudioResolver` update signals → CD triggered — ok
  - No `NgZone.onUnstable/onStable/isStable/onMicrotaskEmpty` usage anywhere
  - SSR (disabled, `ssr:false`) would need `PendingTasks` — irrelevant while ssr=false; note for future re-enable
- [x] **Verified in browser (Playwright):** page renders, play advances clock continuously (signal → CD works), pause freezes clock and icon toggles correctly, 0 console errors. Bundle: polyfills chunk eliminated — initial total 387.97 → **350.21 kB raw**.

## Phase 3 — v21 → v22

- [x] `npx ng update @angular/cli@22 @angular/core@22` → **Angular 22.2.1**
- [x] Expect these automatic migrations; review each in the diff:
  - ~~`withFetch()` removed from `provideHttpClient`~~ → **installer left `withFetch()` in place (deprecated, still the default); pruning deferred to Phase 5**
  - `ChangeDetectionStrategy.Eager` explicitly added to components without a strategy; `Default` renamed → `Eager` → **8 components updated, no `Default` identifiers used**
  - Optional `withNoIncrementalHydration()` may be added to `provideClientHydration` → **added, pre-v22 behavior preserved**
  - `$safeNavigationMigration()` wrappers only if templates rely on pre-v22 `?.` semantics → **none; migration made no changes**
  - New compiler migration list also included: BootstrapContext/withXhr (no-op), duplicate outputs (no-op), istanbul-lib-instrument added while on Karma (via CLI migration)
  - Extended diagnostics `nullishCoalescingNotNullable` and `optionalChainNotNullable` suppressed in `tsconfig.app.json`/`tsconfig.spec.json` — re-enable and clean up in Phase 5
- [x] Confirm TypeScript landed on 6.x: `npx tsc --version` → **6.0.3 (bumped back up now that `@angular/build` 22.2 accepts it)**
- [x] `ng build` — fix compile errors (initial 364.98 kB raw / 97.18 kB transfer; tests 2/2 green on Karma)

## Phase 4 — Karma → Vitest

- [x] Run `ng update @angular/cli --name migrate-karma-to-vitest` → **schematic lives under `ng update`, not `ng generate`; switched builder to `@angular/build:unit-test`, added `vitest` dep, created `:build:testing` config, spec types → `vitest/globals`**
- [x] Run `ng g @schematics/angular:refactor-jasmine-vitest` → **app.spec.ts needed no transformation (jasmine globals map to Vitest globals); report file deleted**
- [x] Remove leftover deps: `karma`, `karma-chrome-launcher`, `karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`, `@types/jasmine`, `jasmine-core`, `istanbul-lib-instrument` → **plus `npm i -D jsdom` — unit-test builder requires a DOM env outside browser mode**
- [x] No zone.js polyfill in tests (fully zoneless; `zone.js/plugins/vitest-patch` NOT added)
- [x] `ng test --watch=false` passes — **Vitest 5.0.3, 1 file / 2 tests, ~1.4 s, no Chrome dependency**

## Phase 5 — Post-migration review

- [x] `Eager` pins decision → **kept (user decision); all 8 components retain `ChangeDetectionStrategy.Eager` explicitly — OnPush default adoption deferred to a future pass**
- [x] Prune `CommonModule`/`provideHttpClient` → **`CommonModule` KEPT: all 4 components genuinely use `ngClass`/`NgTemplateOutlet` (graph-verified, not merely imported). `provideHttpClient(withFetch())` deleted — zero HttpClient injectors in the app**
- [x] Deprecated/default-changed options verified → **no `strictTemplates: false` was ever added (never set in tsconfig); extended-diagnostic `suppress` blocks removed from `tsconfig.app.json` + `tsconfig.spec.json` — production build clean with checks active**
- [x] Stale SSR artifacts → **deleted (user-approved): `src/main.server.ts`, `src/server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`; `server`/`prerender`/`ssr` options removed from angular.json; `serve:ssr:*` script removed; `provideClientHydration(...)` provider + `ngSkipHydration` attribute removed (no-ops without SSR); deps `@angular/ssr`, `@angular/platform-server`, `express`, `@types/express` uninstalled. Re-enable path: `ng add @angular/ssr`**
- [x] `@types/node` → **`^26.6.4` (matches Node v26.5); `@types/express` removed with server.ts**

## Phase 6 — Validation & finish

- [x] `ng build` — no budget errors; **initial total 310.34 kB raw / 81.10 kB transfer vs Phase 0 baseline 382.85 kB raw / 104.11 kB (−19% raw with zone.js + SSR/HMR-hydration artifacts removed)**
- [x] `ng test --watch=false` — all specs pass (Vitest, no Chrome) → **1 file / 2 tests, ~1.4 s**
- [x] `npm start` — interactive smoke via Playwright: play (clock advances), pause (frozen), seek (request 60 s → 01:00), volume (0.5 → 1, `pi-volume-up`), next-track (Amor Sideral → Yeshua, duration 02:17 → 00:56), library search filter ("rap" → 1 card), playlist select → source change, sidebar expand/collapse (searcher + expanded section cycle) — **0 console errors/warnings**
- [x] `app.html` `<audio hidden>` element + resolver `new Audio()` flow unchanged and working (drive-through of the above)
- [x] `AGENTS.md` rewritten for Angular 22 (Vitest command, zoneless + explicit Eager policy, TS 6 pin, SSR removal note, branch convention)
- [ ] Commit; open PR to `dev`

## Known breaking points

| # | Area | Impact here | Action |
|---|------|-------------|--------|
| 1 | v21 `HttpClient` provided by default | `provideHttpClient(withFetch())` in `app.config.ts` unused | Migration removes `withFetch()`; optionally drop `provideHttpClient` entirely |
| 2 | v21 zoneless default | zone.js + `provideZoneChangeDetection` present | Phase 2 removes both |
| 3 | v21 TestBed zoneless by default | `app.spec.ts` — only one spec | Rewritten to Vitest in Phase 4 |
| 4 | v21 Node min (^20.19/22.12/24), v22 drops Node 20 | Node v26.5.0 local — fine | No action |
| 5 | v22 requires TypeScript 6 | TS 5.8 installed | Bumped in Phase 1→ re-verified in Phase 3 |
| 6 | v22 OnPush default | All 10 components lack explicit `changeDetection` | Migration pins `Eager`; Phase 5 adopts `OnPush` |
| 7 | v22 fetch-by-default HTTP; `reportProgress` deprecated | No HttpClient usage in services | Migration handles; nothing manual |
| 8 | v22 incremental hydration default | `provideClientHydration(withEventReplay())` only | Migration may add `withNoIncrementalHydration()` |
| 9 | v21 `NgModuleFactory` removed, HammerJS, ng-reflect removal | Not used in this codebase | None |
| 10 | Karma deprecated but still works in v22 | Chosen to migrate | Phase 4 |
