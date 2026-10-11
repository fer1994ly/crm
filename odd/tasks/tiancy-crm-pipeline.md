# Feature: Tiancy Médica CRM pipeline

## Objective
Mobile-first CRM for Tiancy Médica (Costa Rica, medical equipment) so institutional quotes are tracked by sales stage instead of memory and loose emails.

## Problem / Why
Small clinic quotes get lost while the team focuses on large orders. Every institutional client must stay visible in its stage until the order closes.

## Scope
- Pipeline board: Nuevo contacto → Cotización enviada → En evaluación → Negociación → Pedido cerrado.
- "Mover a la siguiente etapa" advances one stage; closed clients cannot move.
- Client detail with contact history; add notes (persisted).
- New client form; does not submit with missing required fields.
- Access password gate for the whole CRM (no contact shown or read before unlocking); header account menu with reset demo data and lock.
- localStorage persistence, 12 realistic seed clients, reset demo data.
- No backend, no external services (simulated only), no lorem ipsum, no console.log.
- Netlify deployment config; README (run, simulated parts, reset data).

## Constraints
- Stack: React + TypeScript + Vite + Tailwind CSS; localStorage.
- DDD vertical slicing (`src/features/<slice>/{domain,application,infrastructure,ui}`).
- Brand: #1F5C7A, #FFFFFF, #6FAE7B, #16303E; Montserrat (headings), Inter (body).
- UI copy in Spanish (end users in Costa Rica); code/docs in English.
- Fast load (<3s on 4G): small bundle, no heavy deps, lazy routes.

## TDD
- Mode: strict (source: global session config `Strict TDD Mode: enabled`).
- Runners: Vitest + Testing Library (unit/integration), Playwright (E2E, mobile viewport).

## Delivery
- Branch: `main` (explicitly requested by the user), remote `https://github.com/fer1994ly/crm.git`.
- Strategy: single push to main as requested; work-unit commits per task.
- RDD: on (global). Assess per work-unit commit.

## Tasks
- [x] T1 Scaffold: Vite React TS, Tailwind, Vitest, Playwright, ESLint `no-console: error`, netlify.toml — route: delegated
- [x] T2 Pipeline slice: domain (stages, advance, closed lock), seed data, localStorage repository, board UI — route: delegated
- [x] T3 Client detail slice: contact history + add note — route: delegated
- [x] T4 Client creation slice: form with required-field validation — route: delegated
- [x] T5 Admin slice: password gate, contacts list, reset demo data — route: delegated
- [x] T6 README, final checks (lint, unit, integration, E2E, build), push to origin/main — route: inline
- [x] T7 Validate stored client shape on load (drop/reseed invalid records) — review follow-up R3-stored-shape-validation, user-authorized — route: delegated
- [x] T8 Guard ClientDetailPage handlers and show errors in a status region — review follow-up R3-detail-handlers-unguarded, user-authorized — route: delegated
- [x] T9 Review suggestions: detail page reacts to route id change, stable timeline sort, rename/fix misnamed admin e2e — user-authorized — route: delegated
- [x] T10 Gate the whole app behind the access password (criterion "pide la clave antes de mostrar cualquier contacto" read as: the CRM itself is the admin panel). Remove the separate Administración tab; move reset demo data + lock to a header menu; show demo password hint on the login screen; update README and tests — user-authorized (option 2) — route: delegated

## Acceptance criteria
- Move a contact to the next stage without reload.
- Add a note to a contact and it persists.
- Create form does not submit with missing required fields.
- Data survives reload / reopen.
- All screens work on mobile with no clipped elements or covered buttons.
- The CRM asks for the access password before showing any contact.
- Page loads in <3s on 4G mobile.

## Progress / Evidence
- T1: RED: App.test.tsx "renders the brand and primary navigation" failed (cannot resolve ./App). GREEN after Layout/App. lint, typecheck, build, vitest, Playwright smoke (mobile Pixel 7 + desktop) pass. Stack: Vite 8, React 19, Tailwind 4 (@theme tokens), Vitest 5, Playwright 1.64. Route: delegated writer.
- T2: RED: 8 new test files failed on missing modules (stage, seed, client, repository, advanceClientStage, PipelineBoardPage, shared). GREEN: 31 unit/integration tests pass. E2E (written after UI, no separate RED run): 10 Playwright tests pass on mobile+desktop (move without reload, persists after reload, closed locked, no overflow). Mobile board = stage tabs with counts; desktop = 5 columns.
- T3: RED: notes.test.ts (4 tests) failed (addNote/logSimulatedContact undefined); clientActions.test.ts and ClientDetailPage.test.tsx failed on missing modules. GREEN: 45 unit/integration tests pass (note persists via repository, empty-note inline error, advance, closed lock, simulated email/WhatsApp logged). E2E 20/20 pass (note persists after reload, no overflow, 44px targets). Detail route is lazy.
- T4: RED: newClient.test.ts, createClient.test.ts, NewClientPage.test.tsx failed on missing modules. GREEN: 59 unit/integration tests pass (missing fields blocked with inline Spanish errors, quantity 0/-3/2.5/abc rejected, phone/email format, creation at Nuevo contacto). E2E 26/26 pass.
- T5: RED: adminAuth.test.ts, resetDemoData.test.ts, AdminPage.test.tsx failed on missing modules. GREEN: 70 unit/integration tests pass (password gate renders no contacts and never reads the repository before unlock; wrong password; sessionStorage unlock; lock; reset with in-page alertdialog confirm/cancel). E2E 34/34 pass. Password constant lives in src/features/admin/domain/config.ts.

- T6 (partial): README added, commit 0526aff. Parent spot check: npm test 70/70, lint clean, build OK (88.09 kB gzip main), e2e 34/34, console grep empty. RDD assess (base 32f2382, committed-only): medium, review_due=true (slice_budget_reached). User granted; lens review-reliability approved, acknowledged, authority burned (lineage review-f787658da3208c43). Advisory non-blocking follow-ups: R3-stored-shape-validation, R3-detail-handlers-unguarded (WARNING); R3-detail-stale-on-param-change, R3-timeline-comparator, R3-e2e-misnamed-test (SUGGESTION). Pushed to origin/main.

- T7: RED: clientValidation.test.ts failed on missing module; stage.test.ts "throws instead of mapping an unknown stage to the first one" failed; repository tests "drops invalid records, keeps valid ones, and persists the cleaned list" and "reseeds when every stored record is invalid" failed. GREEN after pure `isValidClient` (domain/clientValidation.ts), repository filtering, and `nextStage` throwing on unknown stages. Policy: non-list or unparseable value -> reseed; list with some invalid records -> drop them and persist the cleaned list; non-empty list with no valid record -> reseed; empty list stays empty. E2E (stored-data.spec.ts, written after the fix, no separate RED run) passes on mobile+desktop. Commit 3241ada.
- T8: RED: 3 ClientDetailPage tests (advance, add note, simulated contact after the client is removed from storage) failed with no role="alert" element and an uncaught "El cliente no existe." GREEN after handlers go through a guarded `run` that shows the message in a role="alert" region and swaps to the "Cliente no disponible" view with a "Volver al tablero" link when the client vanished. E2E added to client-detail.spec.ts (commit affd3cb; flaky lazy-load wait fixed in 996805d). Parent spot check: npm test 97/97, console grep empty. RDD assess base 538a9e8 committed-only: medium, review_due=false (under_budget, 287 lines) — stays pending in the slice. Pushed to origin/main.
- T9: RED: 2 new ClientDetailPage tests (route id change /clientes/cli-004 -> cli-011 without unmount) failed: heading of the second client not found, note draft kept ("Borrador del primero"). GREEN after `ClientDetailPage` became a thin wrapper keyed by route id (`<ClientDetail key={id} />`), which remounts and drops client, note draft, alerts and unavailable view. RED: historyOrder.test.ts failed on missing module; GREEN with pure `sortHistoryNewestFirst` (clients domain; `at` descending, ties broken by later insertion first) used by the timeline. E2E (no RED run): the old misnamed test is now "a client advanced on the board is listed in the admin panel"; new "data survives a reopened session after reset" unlocks admin, resets via the in-page confirm, advances a client, reopens a page in the same context (change persisted, password asked again) and a new context from saved storage (data kept, password required since sessionStorage is not carried).

- Review slice T7-T9 (base 538a9e8, 413 lines, medium): user granted; review-reliability approved, acknowledged, authority burned (lineage review-b2cd71e304cf2b43). Advisory follow-ups: R3-cleanup-write-failure-reseeds (WARNING), R3-history-sort-lexicographic, R3-e2e-reopen-assertions (SUGGESTION). Parent spot check: npm test 102/102, console grep empty. Pushed to origin/main.

- T10: RED: accessControl.test.ts (module missing: `createAccessControl is not a function`, 5 failures) and App.test.tsx/AccessGate.test.tsx (could not resolve the removed AdminPage import). GREEN (commit e49df39) after the `admin` slice became `access` (domain/config `ACCESS_PASSWORD` + `ACCESS_SESSION_KEY`, application `createAccessControl` + `resetDemoData`, ui `AccessGate` + `AccessContext`): every route (/, /clientes/nuevo, /clientes/:id, /admin, unknown) renders only the "Acceso" login until unlocked, the client repository is not read (localStorage clients key stays null), unlock keeps the requested deep link, wrong password shows an inline error, demo hint "Clave de demostración: tiancy2026" read from the config constant. RED: AccountMenu.test.tsx 4 failures (no "Cuenta" menu). GREEN (commit e2626b5): header "Cuenta" disclosure menu (Escape/outside click close, focus returns to trigger) with "Restablecer datos de ejemplo" (in-page alertdialog, Escape cancels) and "Cerrar sesión"; Layout remounts the page after a reset and shows a status notice. Decision: the admin contacts table was removed because it duplicated the board; /admin redirects to /. Session key renamed to `tiancy-crm:v1:access-unlocked`. E2E (written alongside, no separate RED run) updated for all specs through `resetAndUnlock`, new access.spec.ts and account-menu.spec.ts (login on fresh visit/deep link with null clients key, unlock, logout, reset, mobile no overflow with menu open, 44px targets). Route: delegated writer.

## Next step
Connect the repo in Netlify; optionally address the new advisory follow-ups.
