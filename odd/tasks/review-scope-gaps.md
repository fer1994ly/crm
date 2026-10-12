# Feature: Review scope gaps (admin panel, business info page, storage notice)

## Objective
Close the three scope items the client reviewer flagged before approval.

## Problem / Why
Reviewer feedback (2026-10-12): the core works, but the brief also asks for (1) an `/admin` panel behind the password listing every contact of every stage with edit and delete, (2) a business information page (what the company does, how to get there with a Google Maps link, social networks), and (3) a visible notice when the browser blocks localStorage, because today `browserStorage()` silently falls back to memory.

## Scope
- T13 `/admin`: protected by the access password (same gate as the rest of the CRM; a fresh visit to `/admin` asks for the password). Lists all contacts across all stages; edit any contact (same required-field validation as creation); delete any contact with an in-page confirm. Linked from the header. Note: T10 had removed the previous admin table; this reintroduces a real admin panel with edit/delete.
- T14 Business info page: what Tiancy Médica does, address with a Google Maps link, social network links. Plausible example data, marked as example data in the README. Reachable from the header (and from the login screen, since it shows no contact data).
- T15 Storage notice: when localStorage is unavailable, show a simple on-screen notice that data will not be saved. Shown on the login screen and inside the app.

## Constraints
- Same stack and DDD vertical slicing as `odd/tasks/tiancy-crm-pipeline.md`.
- UI copy in Spanish; code, comments, docs in English.
- Mobile-first, no overflow, 44px targets, no console.log, no new heavy deps.

## TDD
- Mode: strict (source: global session config `Strict TDD Mode: enabled`).
- Runners: Vitest + Testing Library (`npm test`), Playwright (`npm run test:e2e`, projects mobile, desktop, iphone).

## Delivery
- Branch: `feat/review-scope-gaps` (from `main` at 1a58132).
- Strategy: `single-pr` (one response to one review; forecast ~800-1000 authored lines). Push/PR are the user's decision.
- RDD: on (global). Assess per work-unit commit, base 1a58132.

## Tasks
- [x] T13 Admin panel at /admin: list all contacts, edit, delete — route: delegated (writer trigger: 2+ non-trivial files)
- [x] T14 Business info page with Maps link and social networks; README marks example data — route: delegated
- [x] T15 Visible notice when localStorage is blocked — route: delegated
- [x] T16 Fix review advisories: vacuous layout-notice test, delete result ignored, edit on missing contact silently dropped, inline mock restore leak; re-verify the three requirements end to end — user-authorized — route: delegated

## Acceptance criteria
- `/admin` asks for the password on a fresh session, then lists every contact from every stage.
- A contact can be edited from `/admin` (invalid data blocked) and the change persists after reload.
- A contact can be deleted from `/admin` after confirming, and stays deleted after reload.
- The business info page shows activity, address, a working Google Maps link and social links; README flags the data as example data.
- With localStorage blocked, a visible notice says data will not be saved.
- All existing checks stay green: lint, typecheck, unit, E2E (3 projects), build.

## Progress / Evidence
### T13 (delegated writer)
- RED (unit): `clientDetails.test.ts`, `updateClientDetails.test.ts`, `deleteClient.test.ts`, `AdminPage.test.tsx` failed with "Failed to resolve import" for the missing modules; `localStorageClientRepository.test.ts > removes a client...` failed with `TypeError: repo.remove is not a function`. Routing: `AccessGate.test.tsx > lands on the admin panel when /admin was requested` and `App.test.tsx > renders the brand and primary navigation` failed (no Administración heading/link). The E2E spec was written after the route and was not observed RED separately.
- GREEN: validation extracted to `clientDetails.ts` (shared by `validateNewClient`); `updateClientDetails` and `deleteClient` use cases; `ClientRepository.remove`; `ClientFormFields` shared by NewClientPage and the admin editor; `AdminPage` (cards, in-page alertdialog); lazy `/admin` route; header link. Obsolete "no Administración tab" unit/E2E tests removed.
- Checks: lint clean, typecheck clean, `npm test` 129 passed, `npm run test:e2e` 96 passed (3 projects), build OK, no console.log.
- Decisions: cards (no table) so mobile never overflows; edit keeps history untouched (no history entry added); delete removes history with the contact.

### T14 (delegated writer)
- RED: `businessInfo.test.ts` and `BusinessPage.test.tsx` failed to load (modules missing); `AccessGate.test.tsx > links the login to the public business page` and `> shows the business page without the password...` failed; `App.test.tsx` failed (no Empresa link). E2E written after the implementation (no separate RED run).
- GREEN: `src/features/business/{domain/businessInfo.ts,ui/BusinessPage.tsx}`; public lazy route `/empresa` outside the AccessGate (`App.tsx` now routes `/empresa` before the gated `*`); login link "Sobre Tiancy Médica"; header link "Empresa"; Maps link `https://www.google.com/maps/search/?api=1&query=<encoded>` with target=_blank rel="noopener noreferrer". README documents the example data and where to change it.
- Checks: lint clean, typecheck clean, `npm test` 138 passed, `npm run test:e2e` 108 passed (3 projects), build OK, no console.log.
- Decisions: public page has its own minimal header ("Ir al CRM" link) instead of the CRM Layout; all facts (address, phone, hours, socials) are invented example data.

### T15 (delegated writer)
- RED: `keyValueStorage.test.ts` (canUseStorage / isBrowserStorageAvailable not exported, 4 failures), `StorageNotice.test.tsx` (module missing), `AccessGate.test.tsx > warns on the login screen when the browser blocks storage` and `App.test.tsx > shows the storage notice inside the app layout...` failed. E2E written after the implementation (no separate RED run).
- GREEN: `canUseStorage(target)` (injectable, testable with a failing storage) and `isBrowserStorageAvailable(kind)`; `browserStorage` reuses them (port unchanged); `StorageNotice` (role="status", amber, non-blocking) on the login screen and in `Layout`. README documents the limitation.
- Checks: lint clean, typecheck clean, `npm test` 147 passed, `npm run test:e2e` 117 passed (3 projects, localStorage blocked via `addInitScript`), build OK, no console.log.

### Review slice T13-T15
- Parent spot check: `npm test` 147/147, console grep empty.
- RDD assess base 1a58132 committed-only: medium, review_due (slice_budget_reached, 1384 lines). User granted; review-reliability approved, acknowledged, authority burned (lineage review-d9014b59a162fa2d).
- Advisory (non-blocking): R3-app-layout-notice-test-vacuous (WARNING, src/App.test.tsx:31-40); R3-delete-result-ignored (AdminPage.tsx:158-161), R3-edit-notfound-silently-dropped (AdminPage.tsx:92-93), R3-inline-restore-mocks-leak (AccessGate.test.tsx:51-56) (SUGGESTION).

### T16 (delegated writer)
- Finding 1 (vacuous test): root cause confirmed: with setItem mocked, session storage also fell back to memory, so the pre-set unlock flag was lost and the notice matched on the LOGIN screen. Test rewritten: starts on the login (blocked), unlocks through the UI, waits for the board heading, asserts the login is gone and exactly one notice remains; negative case with storage OK added (fresh modules so the repository singleton is built while blocked). Mutation proof: removed `<StorageNotice />` from Layout -> the blocked test FAILED ("Unable to find ... bloqueando el almacenamiento local"); restored -> 3/3 PASS.
- Findings 2 and 3 RED: 4 new AdminPage tests (vanished contact on edit and delete, throwing repository save/remove) failed with 'Unable to find role "alert"' (and the throw escaping). GREEN: `EditOutcome`, guarded try/catch in edit submit and confirmDelete, role="alert" region, editor/dialog closed, list refreshed from the repository, no false "eliminado" notice. 9/9 pass.
- Finding 4: inline `vi.restoreAllMocks()` moved to `afterEach` in AccessGate.test.tsx, App.test.tsx, AdminPage.test.tsx (also covers the confirm spy); other T13-T15 files already used afterEach.
- Requirement re-verification (E2E, 3 projects): /admin gate + all stored contacts listed (count equals localStorage, 5 distinct stages), edit/delete persist after reload, 44px on Editar/Eliminar/Guardar/Cancelar, no overflow; /empresa (public from login, Maps href/target/rel, socials, README marks example data); storage notice on login and in app when blocked, none when OK (added in-app negative case). Gaps found: none functional; E2E gaps filled: stored-count/5-stage assertion, 44px on all admin actions, vanished-contact edit, in-app no-notice. The vanished-edit E2E was observed RED against the old AdminPage; the other added E2E assertions were written after the behavior.
- Checks: lint clean, typecheck clean, `npm test` 152 passed, `npm run test:e2e` 126 passed (3 projects), build OK, console.log grep empty.
- Commit: 955ff8a fix(admin): surface failed edits and deletes.

- T16 parent check: `npm test` 152/152. RDD assess base 5780849 committed-only: medium, review_due=false (under_budget, 203 lines); stays pending in the slice.

## Next step
Push and open the PR (user decision).
