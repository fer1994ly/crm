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
- Admin panel gated by a password before showing any contact.
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
- [ ] T6 README, final checks (lint, unit, integration, E2E, build), push to origin/main — route: inline

## Acceptance criteria
- Move a contact to the next stage without reload.
- Add a note to a contact and it persists.
- Create form does not submit with missing required fields.
- Data survives reload / reopen.
- All screens work on mobile with no clipped elements or covered buttons.
- Admin panel asks for password before showing any contact.
- Page loads in <3s on 4G mobile.

## Progress / Evidence
- T1: RED: App.test.tsx "renders the brand and primary navigation" failed (cannot resolve ./App). GREEN after Layout/App. lint, typecheck, build, vitest, Playwright smoke (mobile Pixel 7 + desktop) pass. Stack: Vite 8, React 19, Tailwind 4 (@theme tokens), Vitest 5, Playwright 1.64. Route: delegated writer.
- T2: RED: 8 new test files failed on missing modules (stage, seed, client, repository, advanceClientStage, PipelineBoardPage, shared). GREEN: 31 unit/integration tests pass. E2E (written after UI, no separate RED run): 10 Playwright tests pass on mobile+desktop (move without reload, persists after reload, closed locked, no overflow). Mobile board = stage tabs with counts; desktop = 5 columns.
- T3: RED: notes.test.ts (4 tests) failed (addNote/logSimulatedContact undefined); clientActions.test.ts and ClientDetailPage.test.tsx failed on missing modules. GREEN: 45 unit/integration tests pass (note persists via repository, empty-note inline error, advance, closed lock, simulated email/WhatsApp logged). E2E 20/20 pass (note persists after reload, no overflow, 44px targets). Detail route is lazy.
- T4: RED: newClient.test.ts, createClient.test.ts, NewClientPage.test.tsx failed on missing modules. GREEN: 59 unit/integration tests pass (missing fields blocked with inline Spanish errors, quantity 0/-3/2.5/abc rejected, phone/email format, creation at Nuevo contacto). E2E 26/26 pass.
- T5: RED: adminAuth.test.ts, resetDemoData.test.ts, AdminPage.test.tsx failed on missing modules. GREEN: 70 unit/integration tests pass (password gate renders no contacts and never reads the repository before unlock; wrong password; sessionStorage unlock; lock; reset with in-page alertdialog confirm/cancel). E2E 34/34 pass. Password constant lives in src/features/admin/domain/config.ts.

## Next step
T1 scaffold.
