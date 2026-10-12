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
| `npm run test:e2e` | E2E tests (Playwright: mobile Pixel 7, desktop Chrome and iPhone 15 on WebKit/Safari). Run `npx playwright install chromium webkit` once first |

## Access screen and demo password

The whole CRM sits behind an access screen: on any route (board, client detail, new client, admin) nothing is shown, and no contact is read from storage, until the access password is entered. After unlocking you land on the page you asked for (deep links work).

- **Demo password**: `tiancy2026`. It is also printed on the login screen ("Clave de demostración").
- **Where it is configured**: `ACCESS_PASSWORD` in `src/features/access/domain/config.ts` (single constant).
- **Session**: the unlock lasts for the browser tab (sessionStorage key `tiancy-crm:v1:access-unlocked`). Use **Cuenta → Cerrar sesión** to lock again.
- **Client-side demo auth**: it only keeps casual viewers out of a prototype and is not real security. The backend integration must replace it with real authentication.

## Screens

- **Acceso** (any route while locked): password form.
- **Tablero** (`/`): pipeline by stage. On mobile, stage tabs with counts; on desktop, five columns.
- **Ficha del cliente** (`/clientes/:id`): data, contact history, add a note, advance stage, simulated contact actions.
- **Nuevo cliente** (`/clientes/nuevo`): creation form; it does not submit while a required field is missing.
- **Administración** (`/admin`, behind the access password): every contact of every stage as cards. **Editar** reuses the creation validation (required fields, quantity, phone/email format) and keeps stage and history; **Eliminar** asks for an in-page confirmation and removes the contact (history included) from storage.
- **Sobre Tiancy Médica** (`/empresa`, public): what the company does, address with a Google Maps link, hours and social links. It shows no contact data, so it is reachable without the password (link on the login screen and **Empresa** in the header).
- **Cuenta** (header menu): **Restablecer datos de ejemplo** (with an in-page confirmation) and **Cerrar sesión**.

## What is simulated

There is no backend and no external service:

- **Data**: stored in the browser `localStorage` under the key `tiancy-crm:v1:clients`. On first load, 12 sample institutional clients are seeded across all stages.
- **"Enviar cotización por correo" / "Enviar por WhatsApp"**: no message is sent; the action only records a simulated entry in the client's contact history.
- **Blocked browser storage**: if the browser blocks `localStorage` (private mode, disabled site data), the app keeps working with in-memory storage and shows a visible, non-blocking notice on the login screen and inside the app: «Tu navegador está bloqueando el almacenamiento local: los cambios no se guardarán al cerrar o recargar la página.» Nothing is persisted in that state. The detection is `isBrowserStorageAvailable()` in `src/shared/storage/keyValueStorage.ts`.
- **Access control**: a client-side demo password, not real security. The backend integration should replace it.

## Business information page (example data)

The text, address, phone, hours and social links on `/empresa` are **EXAMPLE data: plausible, not real** (the address, phone number, `info@tiancymedica.example` and the Facebook, Instagram, LinkedIn and WhatsApp URLs are invented). Replace them in `src/features/business/domain/businessInfo.ts` (`BUSINESS_INFO`); the Google Maps link is derived from the address automatically.

## Resetting the sample data

Either:

1. Open the header menu **Cuenta** and choose **Restablecer datos de ejemplo**, then confirm, or
2. Delete the `tiancy-crm:v1:clients` key from the browser's localStorage (DevTools → Application → Local Storage) and reload.

## Architecture

Vertical slices with DDD layers under `src/features/<slice>/{domain,application,infrastructure,ui}`:

- `pipeline`: stage model, advance rule, board.
- `clients`: client aggregate, seed data, creation, detail and notes, localStorage repository.
- `access`: password gate, account menu (lock, demo data reset).

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

React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Vitest, Testing Library, Playwright. Fonts (Inter, Montserrat) are self-hosted via Fontsource; pages load lazily behind the access gate.
