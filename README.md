# Tiancy Médica CRM

Mobile-first CRM for Tiancy Médica (Costa Rica) to track institutional quotes through the sales pipeline:

**Nuevo contacto → Cotización enviada → En evaluación → Negociación → Pedido cerrado**

Each client has exactly one active stage. "Mover a la siguiente etapa" advances it one position, and a client in "Pedido cerrado" can no longer move.

## Getting started

Requirements: Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint (`no-console` is an error) |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Unit and integration tests (Vitest + Testing Library) |
| `npm run test:e2e` | E2E tests (Playwright, mobile Pixel 7 + desktop). Run `npx playwright install chromium` once first |

## Screens

- **Tablero** (`/`): pipeline by stage. On mobile, stage tabs with counts; on desktop, five columns.
- **Ficha del cliente** (`/clientes/:id`): data, contact history, add a note, advance stage, simulated contact actions.
- **Nuevo cliente** (`/clientes/nuevo`): creation form; it does not submit while a required field is missing.
- **Administración** (`/admin`): asks for the password before showing any contact.

## Admin password (demo)

`tiancy2026` — defined in `src/features/admin/domain/config.ts`. The unlock lasts for the browser tab session (sessionStorage).

## What is simulated

There is no backend and no external service:

- **Data**: stored in the browser `localStorage` under the key `tiancy-crm:v1:clients`. On first load, 12 sample institutional clients are seeded across all stages.
- **"Enviar cotización por correo" / "Enviar por WhatsApp"**: no message is sent; the action only records a simulated entry in the client's contact history.
- **Admin authentication**: a client-side demo password, not real security. The backend integration should replace it.

## Resetting the sample data

Either:

1. Go to **Administración**, enter the password and use **Restablecer datos de ejemplo**, or
2. Delete the `tiancy-crm:v1:clients` key from the browser's localStorage (DevTools → Application → Local Storage) and reload.

## Architecture

Vertical slices with DDD layers under `src/features/<slice>/{domain,application,infrastructure,ui}`:

- `pipeline`: stage model, advance rule, board.
- `clients`: client aggregate, seed data, creation, detail and notes, localStorage repository.
- `admin`: password gate, contacts list, demo data reset.

`src/shared` holds the storage port/adapters and small helpers; `src/app/repositories.ts` is the composition root. The domain is plain TypeScript; use cases depend on the `ClientRepository` port, so a backend adapter can replace the localStorage one.

## Deployment (Netlify)

`netlify.toml` is ready: build `npm run build`, publish `dist`, Node 24, SPA fallback redirect and immutable cache headers for hashed assets.

- **From Git**: Netlify → *Add new site → Import an existing project* → choose this repository. Settings are read from `netlify.toml`.
- **From the CLI**:

  ```bash
  npx netlify-cli login
  npx netlify-cli deploy --build          # preview URL
  npx netlify-cli deploy --build --prod   # production
  ```

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Vitest, Testing Library, Playwright.
