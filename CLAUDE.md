# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`flotillas-ita` is a Next.js 12 (Pages Router) application for Grupo Intecsa that manages fleet operations: creating and tracking **Traslado**, **Flete**, and **Renta** documents, vehicle exit/entry logs, shipping requests (paquetería), and IT equipment inventory. It is a frontend-only Next.js app that consumes an external REST API.

## Common Commands

- **Dev server:** `pnpm dev` (or `npm run dev`) — runs on port `3001`
- **Production build:** `pnpm build` (or `npm run build`)
- **Production start:** `pnpm start` (or `npm run start`)
- **Lint:** `pnpm lint` (or `npm run lint`) — ESLint extends `next/core-web-vitals`
- **No test runner is configured.**

The project uses **pnpm** (`pnpm-lock.yaml` is present).

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
- `Layout.jsx` wraps authenticated pages with `withPageAuthRequired` and renders the `Appbar` + MUI `Container`.
- `pages/_app.js` conditionally excludes some routes from the `GlobalStateProvider` + `Layout` wrapper. The excluded routes are public:
  - `/paqueterita`
  - `/paqueterita/attempt/[paqueteria_id]`
  - `/control-vehicular`
  - `/flotilla/[id]/[type]`
- `_app.js` also has a `getInitialProps` that injects a mock user when `VERCEL_ENV === 'preview'`.

### Core Domain: Fleet Documents
The main workflow:
1. **Dashboard** (`pages/index.js`) lists companies fetched from `/flotilla/empresas/get`.
2. **Company Detail** (`pages/[empresaId].js`) is a server-rendered page that fetches a company's documents (`Traslado`, `Flete`, `Renta`) and active vehicles. It renders a `TabPanel` with `TableFlotillas` (MUI X DataGrid).
3. **Document Creation** (`Components/Modal/NewDocument.jsx`) is a large Drawer form that creates new documents. It depends on vehicle selection, plan selection, and folio numbers fetched from the API.
4. **PDF Handling:** `utils/getPDF.js` triggers PDF downloads from the API. `pages/flotilla/[id]/[type].js` is a public page that fetches a PDF as an ArrayBuffer, creates a blob URL, and renders it in an iframe.
5. **Row Normalization:** `utils/getRowData.js` flattens the three document types into a single array for the DataGrid. `utils/columnsTables.js` defines the DataGrid columns.

### Modules
- **Paquetería** (`/paqueterita`): Public shipping request form using Google Maps Autocomplete (`@react-google-maps/api`). Posts to the external API. Admin view at `/shipping` lists requests.
- **Control Vehicular** (`/control-vehicular`): Public form for vehicle exit/entry logs. Uses `react-hook-form` + `zod` + `@hookform/resolvers/zod`.
- **Vehicles** (`/vehicles`, `/newvehicleslist`): Vehicle listings. `/newvehicleslist` appears to be a newer version.
- **Sistemas / IT Inventory** (`/mantenimiento`, `/inventarioti`): Equipment tracking board. Currently relies on static JSON data (`csvjson.json`, `mante_impre.json`, `obra_equipos.json`) and a kanban-style grid (`ColumnaSistemas`).
- **ITA-Utils** (`/ita-utils`): Admin utilities, including a tool to upload catalog PDFs to Firebase Storage.

### State & Data Patterns
- **GlobalStateProvider** (`context/GlobalContext.js`) is minimal: it only persists `lastDocumentsCreated` to `localStorage`.
- **SWR** is the primary remote state cache. The fetcher is a plain `fetch(...).then(res => res.json())`.
- **Forms:** Newer forms (paquetería, control-vehicular) use `react-hook-form` with `zod` validation. Older forms use `useForm` without schema resolvers.
- **Notifications:** `react-toastify` is used globally (imported in `_app.js`).
- **Styling:** MUI v5 with a custom theme in `_app.js` that sets the font to `Barlow`.

### Firebase Storage
`firebase/client.js` initializes Firebase Storage (v9 modular SDK). It is used in `ita-utils` to upload catalog PDFs and register them via a GraphQL mutation to the external API.

### Important File Conventions
- Pages use `.js`, `.jsx`, and `.tsx` interchangeably.
- The components directory is capitalized: `Components/`.
- `lib/empresas.json` is a static JSON file used to map company IDs to names across the app.
- `tsconfig.json` has `strict: false`.

### Environment Variables
The app relies on several env vars defined in `.env.local` (which is in `.gitignore`). Key categories:
- `NEXT_PUBLIC_API` — external REST API base URL
- `PDF_SERVICE_URL` — external PDF generation service
- Auth0 variables (`AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`)
- Email variables (`USER_GMAIL`, `USER_GMAIL_PASSWORD`, `SENDGRID_API_KEY`, `NEXT_PUBLIC_GMAIL_LIST`)
- `OPEN_IA_KEY`, `OPEN_IA_PROJECT` — OpenAI integration
- `NEXT_PUBLIC_GOOGLE_API_KEY` — Google Maps API
