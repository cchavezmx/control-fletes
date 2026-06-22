# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`flotillas-ita` is a Next.js 14.2 (Pages Router) + React 18.3 application for Grupo Intecsa that manages fleet operations: creating and tracking **Traslado**, **Flete**, and **Renta** documents, vehicle exit/entry logs, shipping requests (paquetería), and IT equipment inventory. It is a frontend-only Next.js app that consumes an external REST API. The codebase recently finished a MUI→shadcn/ui + Tailwind CSS migration (see `docs/migration-status.md`); MUI X DataGrid and DatePicker were intentionally retained.

## Common Commands

- **Dev server:** `pnpm dev` (or `npm run dev`) — runs on port `3001`
- **Production build:** `pnpm build` (or `npm run build`) — `next.config.js` has `eslint.ignoreDuringBuilds: true`, so build will not fail on lint errors. Run `pnpm lint` separately.
- **Production start:** `pnpm start` (or `npm run start`)
- **Lint:** `pnpm lint` (or `npm run lint`) — ESLint extends `next/core-web-vitals` (note: `eslint-config-next` is pinned to 16.2.6 even though Next is 14; this is intentional during the migration).
- **No test runner is configured.**

The project uses **pnpm** (`pnpm-lock.yaml` + `pnpm-workspace.yaml` are present). The workspace file declares build-script approvals for `protobufjs`, `tesseract.js`, and `unrs-resolver` — these are required for a clean `pnpm install` on first checkout.

## High-Level Architecture

### External API Dependency
The app is not full-stack with a local database. Almost all data is fetched from an external REST API defined by `NEXT_PUBLIC_API` (currently pointed at a Railway-hosted service). Data fetching happens in two ways:
- **Client-side:** `useSWR` (configured globally in `pages/_app.js`)
- **Server-side:** `getServerSideProps` on select pages (e.g., `pages/[empresaId].js`, `pages/vehicles/index.jsx`, `pages/inventarioti/index.jsx`)

Internal API routes (`pages/api/*`) are minimal proxies:
- `pages/api/paqueteria.js` — proxies PDF generation to `PDF_SERVICE_URL`
- `pages/api/nodmailer.js` — sends emails via Gmail SMTP using `nodemailer`
- `pages/api/auth/[...auth0].js` — Auth0 handler

### Auth & Route Layout
Authentication is handled by `@auth0/nextjs-auth0`.
- `middleware.js` (edge) configures `publicRoutes` for Auth0.
- `Layout.jsx` wraps authenticated pages with `withPageAuthRequired` and renders the `Appbar` inside a `max-w-7xl mx-auto px-4` Tailwind container. When the current route matches `/[a-f0-9]{24}` (the expediente detail pattern) it adds an `is-locked` class that owns the scroll — keep this so the table fills the viewport.
- `pages/_app.js` conditionally excludes some routes from the `GlobalStateProvider` + `Layout` wrapper. The excluded routes are public:
  - `/paqueterita`
  - `/paqueterita/attempt/[paqueteria_id]`
  - `/control-vehicular`
  - `/flotilla/[id]/[type]`
- `_app.js` also has a `getInitialProps` that injects a mock user when `VERCEL_ENV === 'preview'`.

### Core Domain: Fleet Documents
The main workflow:
1. **Dashboard** (`pages/index.js`) lists companies fetched from `/flotilla/empresas/get`.
2. **Company Detail** (`pages/[empresaId].js`) is a server-rendered page that fetches a company's active + cancelled documents and active vehicles in parallel (cancelled requires `?type=cancel` on the same endpoint). The page is the "expediente" UI: KPI strip, filter chips, custom table, pagination, floating action toolbar, and drawers for detail/preview/cancel. It does NOT use the MUI DataGrid for the main list — that is the older `TableFlotillas` in `Components/`.
3. **Document Creation Wizard** (`pages/documento/nuevo.jsx` → `Components/DocumentWizard/index.jsx` → `hooks/useDocumentWizard.js`) is a 6-step form (Tipo/Vehículo, Cliente/Fechas, Detalles, Revisión de Unidad, Facturación, Resumen). The wizard is the single source of truth for the document payload: it fetches folios by empresa, plans by vehicle slug, validates with `zod`, builds a `cost_breakdown` subobject + a `pre_flight` subobject, and POSTs to `${NEXT_PUBLIC_API}/flotilla/insert?type=traslado|flete|renta`. The PDF service spec for the resulting payload is documented in `docs/pdf-payload-spec.md`. The original Drawer form at `Components/Modal/NewDocument.jsx` is legacy and is no longer mounted on the expediente page.
4. **PDF Handling:** `utils/getPDF.js` triggers PDF downloads from the API (returns ArrayBuffer → blob → `file-saver`). `pages/flotilla/[id]/[type].js` is a public page that fetches the same PDF endpoint, creates a blob URL, and renders it in an iframe (no `Layout`/`Appbar` because it is in the Auth0 excluded list).
5. **Row Normalization:** `utils/getRowData.js` flattens the three document types into a single array (adds `type`, formatted dates, and resolved `bussiness_cost` name from `lib/empresas.json`). `utils/columnsTables.js` defines the older DataGrid columns. The expediente page implements its own sort/filter/page in `pages/[empresaId].js`.
6. **Document edit/cancel:** `pages/update/[objectId].js` is the edit page; `Components/Modal/CancelModalDocument.jsx` is the cancel modal. The `isCancel_status` field on the document is the truth for cancellation — a non-empty value means cancelled.

### Modules
- **Paquetería** (`/paqueterita`): Public shipping request form using Google Maps Autocomplete (`@react-google-maps/api`). Posts to the external API; PDFs are proxied through `pages/api/paqueteria.js` → `PDF_SERVICE_URL`. Admin view at `/shipping` lists requests.
- **Control Vehicular** (`/control-vehicular`): Public form for vehicle exit/entry logs. Uses `react-hook-form` + `zod` + `@hookform/resolvers/zod`, and is one of the two places that still uses `@mui/x-date-pickers`.
- **Vehicles** (`/vehicles`, `/newvehicleslist`): Vehicle listings. `/newvehicleslist` is the newer entry point and is linked from the Appbar. The expediente pulls active vehicles server-side from `${NEXT_PUBLIC_API}/flotilla/vehicles`.
- **Sistemas / IT Inventory** (`/mantenimiento`, `/inventarioti`): Equipment tracking board. Currently relies on static JSON data (`csvjson.json`, `mante_impre.json`, `obra_equipos.json`) and a kanban-style grid (`ColumnaSistemas`).
- **ITA-Utils** (`/ita-utils`): Admin utilities, including a tool to upload catalog PDFs to Firebase Storage (`firebase/client.js` → `addFile()` → GraphQL mutation to `graphql-api-production.up.railway.app`).

### Design & Spec Docs
The `docs/` directory holds long-form specs the codebase references. Read these before changing the wizard, the PDF payload, or the expediente UI:
- `docs/pdf-payload-spec.md` — contract for what the wizard POSTs and the PDF service renders.
- `docs/backend-requirements.md` — gap analysis between wizard output and what the backend currently stores.
- `docs/backend-fix-get-endpoint.md` — why `${API}/flotilla/documentos/${empresaId}` requires a second call with `?type=cancel` to get cancelled documents.
- `docs/migration-status.md` — current MUI→shadcn/Tailwind migration state (mostly done; MUI X DataGrid/DatePicker kept by decision).
- `docs/migration-shadcn-plan.md` — the original migration plan (largely historical now).
- `docs/design-brief-expediente.md` — UX brief for the expediente page.

### Important File Conventions
- **Two components directories exist on purpose:** `components/` (lowercase) holds shadcn/ui primitives generated by `npx shadcn add`; `Components/` (capitalized) holds feature components. Do not move files between them — the import aliases differ (`@/components/ui/...` vs relative `../Components/...`).
- Pages use `.js`, `.jsx`, and `.tsx` interchangeably.
- `lib/empresas.json` is a static JSON file used to map company IDs to names across the app.
- `tsconfig.json` has `strict: false` and includes `**/*.js`/`**/*.jsx` so JS files are type-checked too.
- `jsconfig.json` defines the `@/components`, `@/lib`, `@/hooks` path aliases used by shadcn/ui and the new code.
- `.env.local` is gitignored. It defines `NEXT_PUBLIC_API` (the only var read at runtime for data fetching), Auth0 vars, `PDF_SERVICE_URL`, email creds, `OPEN_IA_KEY`/`OPEN_IA_PROJECT`, and `NEXT_PUBLIC_GOOGLE_API_KEY`.

### State & Data Patterns
- **GlobalStateProvider** (`context/GlobalContext.js`) is minimal: it persists `lastDocumentsCreated` to `localStorage`. The current `saveLastDocuments` overwrites `localStorage` with only the new payload instead of merging — fix before relying on it.
- **SWR** is the primary remote state cache. The fetcher is a plain `fetch(...).then(res => res.json())` defined in `pages/_app.js`. The expediente page (`pages/[empresaId].js`) bypasses SWR and uses `getServerSideProps` + local `useState` for filter/sort/page.
- **Forms:** Newer forms (DocumentWizard, paquetería, control-vehicular) use `react-hook-form` with `zod` resolvers. Older forms in `Components/Modal/` use `useForm` without schema resolvers. The wizard's `DOCUMENT_SCHEMA` is exported from `hooks/useDocumentWizard.js` and reused by callers.
- **Notifications:** `react-toastify` is used globally (mounted in `_app.js`).
- **Styling:** Tailwind CSS is the primary styling system. The MUI theme that previously lived in `_app.js` was removed during the MUI→shadcn migration. The brand font is **Barlow**, loaded globally; the Intecsa brand primary is `#3f51b5`.
- **Icons:** `lucide-react` (replaced `@mui/icons-material`).
- **MUI residuals:** Only two MUI packages remain in production: `@mui/x-data-grid` (for the older `TableFlotillas`, `flotilla/TableDocuments.jsx`, and `paqueteria/ShippingGrid.jsx`) and `@mui/x-date-pickers` (for `flotilla/DatePickerValue.jsx` and `control-vehicular/index.js`). `@mui/material` and `@mui/system` stay as transitive peers. There is only one direct import of `@mui/material` in the codebase (`TextField` inside `DatePickerValue.jsx`).

### Firebase Storage
`firebase/client.js` initializes Firebase Storage (v9 modular SDK). It is used in `ita-utils` to upload catalog PDFs and register them via a GraphQL mutation to the external API. The build will print a Firebase error when credentials are missing; it does not block the build.

### Environment Variables
The app relies on several env vars defined in `.env.local` (which is in `.gitignore`). Key categories:
- `NEXT_PUBLIC_API` — external REST API base URL
- `PDF_SERVICE_URL` — external PDF generation service
- Auth0 variables (`AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`)
- Email variables (`USER_GMAIL`, `USER_GMAIL_PASSWORD`, `SENDGRID_API_KEY`, `NEXT_PUBLIC_GMAIL_LIST`)
- `OPEN_IA_KEY`, `OPEN_IA_PROJECT` — OpenAI integration
- `NEXT_PUBLIC_GOOGLE_API_KEY` — Google Maps API
