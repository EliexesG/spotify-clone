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

- [ ] Commit/stash all local work; branch off `dev`: `git checkout -b chore/angular-22-upgrade dev`
- [ ] `npm install` and confirm node_modules is fresh
- [ ] Baseline verification: `ng build` (record bundle size vs budgets: initial 500kB warn/1MB error; component styles 4kB warn/8kB error)
- [ ] Baseline tests: `ng test --watch=false --browsers=ChromeHeadless`
- [ ] Analyze update plan: `npx ng update` (list only)

## Phase 1 — v20 → v21

- [ ] `npx ng update @angular/cli@21 @angular/core@21`
  - Auto-updates `@angular/build`, `@angular/ssr` and peer deps to 21 (requires TS ≥5.9)
- [ ] Review the migration diff only; revert nothing blindly
- [ ] Watch for the known quirk: migration may inject `provideZoneChangeDetection()` into `main.server.ts` bootstrap (angular/angular#65408) — remove it (we go zoneless in Phase 2)
- [ ] `ng build` — fix compile errors; run tests once
- [ ] Bump TypeScript now (step-stone for TS 6 in v22): `npm i -D typescript@^6.0`

## Phase 2 — Zoneless migration

- [ ] Remove `provideZoneChangeDetection` from `src/app/app.config.ts`
- [ ] Remove `zone.js` and `zone.js/testing` from `angular.json` polyfills (build and test targets)
- [ ] `npm uninstall zone.js`
- [ ] Verify zoneless compatibility (already confirmed, re-check after edit):
  - All template state is signals read in templates (audioPlayer services, `filteredPlaylists`, etc.)
  - `[(ngModel)]` (+ FormsModule) schedules CD in zoneless v21+ — ok
  - `@HostListener('document:click')` triggers CD for bound listeners — ok
  - `new Audio()` listeners in `AudioResolver` update signals → CD triggered — ok
  - No `NgZone.onUnstable/onStable/isStable/onMicrotaskEmpty` usage anywhere
  - SSR (disabled, `ssr:false`) would need `PendingTasks` — irrelevant while ssr=false; note for future re-enable

## Phase 3 — v21 → v22

- [ ] `npx ng update @angular/cli@22 @angular/core@22`
- [ ] Expect these automatic migrations; review each in the diff:
  - `withFetch()` removed from `provideHttpClient` (fetch is now the default)
  - `ChangeDetectionStrategy.Eager` explicitly added to components without a strategy; `Default` renamed → `Eager`
  - Optional `withNoIncrementalHydration()` may be added to `provideClientHydration` if not opted into incremental hydration
  - `$safeNavigationMigration()` wrappers only if templates rely on pre-v22 `?.` semantics — none known in this app; confirm in diff
- [ ] Confirm TypeScript landed on 6.x: `npx tsc --version` (else fix `npm i -D typescript@^6.0`)
- [ ] `ng build` — fix compile errors

## Phase 4 — Karma → Vitest

- [ ] `ng generate @angular/core:migrate-karma-to-vitest` — switches builder to `@angular/build:unit-test`, adds/removes deps
- [ ] `ng generate @angular/core:refactor-jasmine-vitest` — converts `src/app/app.spec.ts` to Vitest APIs
- [ ] Remove leftover deps if the schematic doesn't: `npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter @types/jasmine`
- [ ] If zone.js was kept for tests (we removed it), don't add `zone.js/plugins/vitest-patch`; write zoneless-native tests instead
- [ ] `ng test --watch=false` must pass with no Chrome dependency

## Phase 5 — Post-migration review

- [ ] Decide on `Eager` pins: v22's default is `OnPush`; all components here are signal-driven, so either keep the migration's explicit `Eager` or drop the property to adopt `OnPush`. Adopt `OnPush` (objective of the upgrade) — verify each component renders/updates (smoke test `npm start`)
- [ ] Prune now-optional `CommonModule` imports where templates don't use NgIf/NgFor/NgStyle etc. (all use built-in control flow `@if/@for/@let` — likely all removable) and `provideHttpClient` (unused by any service)
- [ ] Deprecated/default-changed options to verify in config: `strictTemplates` is now default — remove explicit opt-out if migration added one; keep budgets as-is unless warned
- [ ] Clean stale SSR artifacts (optional but recommended since `ssr:false` and `serve:ssr:spotify-clone` script points to a bundle never emitted): delete `src/main.server.ts`, `src/server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`, remove `mainServer`-related angular.json entries and the `serve:ssr:*` script — or keep and fix if SSR is planned
- [ ] Update `@types/node` to match Node major (currently `^20` → `^24`/`^26` compatible set) and confirm `@types/express` needed only if server.ts kept

## Phase 6 — Validation & finish

- [ ] `ng build` — no budget errors; compare bundle size to Phase 0 baseline (expect drop from zone.js removal)
- [ ] `ng test --watch=false` — all specs pass (Vitest, no Chrome)
- [ ] `npm start` — manual smoke: play/pause, volume, seek slider, card hover-highlight, library search filter, expand/collapse, playlist select → playback
- [ ] Confirm `app.html` `<audio hidden>` element and the resolver-`new Audio()` flow still behave (no framework dependency changed here)
- [ ] Update `AGENTS.md`: test runner (Vitest via `ng test --watch=false`), Angular v22, strictTemplates default, removed SSR files (if deleted), zoneless (zone.js uninstalled)
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
