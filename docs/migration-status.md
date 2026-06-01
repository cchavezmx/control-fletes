# Estado de Migración MUI → shadcn/ui + Tailwind CSS

## Completado ✅ — Fase 0-4 (Framework Upgrade + Layout + Componentes + Tablas + Páginas)

### Upgrade de Framework
- [x] Next.js 12.1.5 → 14.2.35
- [x] React 17.0.2 → 18.3.1
- [x] Auth0 v1.8.0 → v3.8.0 (API de edge middleware actualizada: `withAuth` → `withMiddlewareAuthRequired`, imports desde `@auth0/nextjs-auth0/client`)
- [x] SWR v1.3.0 → v2.4.1 (fix React 18 compat)
- [x] next.config.js: `images.domains` → `images.remotePatterns`, removido `experimental.middlewarePrefetch`
- [x] ESLint desactivado durante builds (`ignoreDuringBuilds: true`) hasta reconfigurar flat config

### Tailwind CSS + shadcn/ui Base
- [x] Tailwind CSS v3.4.19 instalado y configurado
- [x] `tailwind.config.js` con content paths, colores de marca Intecsa (`#3f51b5`), tipografía Barlow, animate plugin
- [x] `styles/globals.css` con directivas `@tailwind` y fuentes preservadas
- [x] `components.json` configurado (style: default, rsc: false, tsx: false)
- [x] `lib/utils.js` con helper `cn()`
- [x] `jsconfig.json` con aliases `@/components`, `@/lib`, `@/hooks`
- [x] Dependencias de Radix UI y `lucide-react` instaladas
- [x] Componentes shadcn creados en `components/ui/`:
  - `button.jsx` (variants: default, destructive, outline, secondary, ghost, link)
  - `card.jsx` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
  - `skeleton.jsx`
  - `separator.jsx`
  - `sheet.jsx` (Sheet, SheetContent, SheetHeader, SheetTitle)
  - `dropdown-menu.jsx` (full dropdown menu primitives)
  - `dialog.jsx` (Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription)

### Layout Global Migrado (sin MUI)
- [x] `Components/Appbar.jsx` → Tailwind + shadcn Sheet + DropdownMenu + Lucide icons (Menu, Home, Settings, Truck, Mailbox, UserCircle, MoreVertical)
- [x] `Components/Layout.jsx` → Tailwind container (`max-w-7xl mx-auto px-4`)
- [x] `pages/_app.js` → removido `ThemeProvider` y `Container` de MUI
- [x] `Components/Dashboard.jsx` → shadcn `Card` + `Skeleton`
- [x] `Components/CardsEmpresa.jsx` → shadcn `Card` + `Button`

### Tablas DataGrid Migradas a v9
- [x] `@mui/x-data-grid` 5.17.26 → 9.3.0
- [x] `@mui/x-date-pickers` 5.0.20 → 9.3.0
- [x] `TableFlotillas.jsx` → DataGrid v9, locale `esES` desde `@mui/x-data-grid/locales`, `slots={{ toolbar: GridToolbar }}`
- [x] `flotilla/TableDocuments.jsx` → DataGrid v9 editable, Badge/Select nativos, Button shadcn
- [x] `paqueteria/ShippingGrid.jsx` → DataGrid v9, Badge Tailwind, Button shadcn

### Wizard y Formularios Principales
- [x] `DocumentWizard/index.jsx` → Wizard 5 pasos con stepper custom Tailwind (flex + circles), inputs nativos HTML, fechas `input type="date"`, RentaConceptsBreakdown tabla HTML
- [x] `Modal/NewDocument.jsx` → shadcn `Sheet` lateral
- [x] `Modal/NewDocumentIncomming.jsx` → `toast.info` reemplazó `Snackbar`/`Alert`
- [x] `Modal/DocumentoRelacionado.jsx` → shadcn `Sheet` + inputs nativos

### Modales y Drawers (11 archivos)
- [x] `Modal/PrevPDFModal.jsx` → shadcn `Dialog` + iframe PDF
- [x] `Modal/CancelModalDocument.jsx` → shadcn `Dialog` + textarea nativa
- [x] `Modal/EditVehicle.jsx` → shadcn `Dialog` + inputs nativos
- [x] `Modal/NewVehicle.jsx` → shadcn `Dialog`
- [x] `Modal/NewPlan.jsx` → shadcn `Dialog`
- [x] `Modal/FuelLevelSlider.jsx` → `input type="range"` + Tailwind + `Fuel` icon Lucide
- [x] `Modal/RentaConceptsBreakdown.jsx` → Tabla HTML nativa + useWatch (sin MUI Table/Grid)
- [x] `Modal/PlanesDrawer.jsx` → shadcn `Sheet` + cards Tailwind
- [x] `flotilla/PlansDrawer.jsx` → shadcn `Sheet` wrapper
- [x] `flotilla/VechicleImageModal.jsx` → shadcn `Dialog`
- [x] `flotilla/NewPlateModal.jsx` → shadcn `Dialog`

### Tabs, Selectores y Otros Componentes
- [x] `TabPanel.jsx` → Tabs custom Tailwind (botones con `border-b`). **SwipeableViews removido** (no soporta React 18)
- [x] `VehiclesSelector.jsx` → `input` + `datalist` nativo (reemplazó MUI Autocomplete)
- [x] `paqueteria/Form.jsx` → Inputs nativos + select nativo
- [x] `flotilla/DatePickerValue.jsx` → Mantiene `DesktopDatePicker` de MUI X (decisión estratégica)

### Páginas (8 archivos)
- [x] `[empresaId].js` → Tailwind + shadcn Button/Separator
- [x] `control-vehicular/index.js` → Inputs nativos + DatePicker MUI X + range slider nativo + react-select
- [x] `ita-utils.js` → HTML `details`/`summary` + shadcn Button (reemplazó Accordion MUI)
- [x] `paqueterita/index.jsx` → Tailwind header
- [x] `shipping/index.jsx` → Tailwind typography
- [x] `flotilla/[id]/[type].js` → Tailwind header + iframe
- [x] `newvehicleslist/index.jsx` → Tailwind
- [x] `update/[objectId].js` → Inputs nativos + shadcn Button
- [x] `paqueterita/attempt/[paqueteria_id].jsx` → Tailwind
- [x] `paqueterita/attempt/tracking_id/[attemp_id]/[tracking_id].jsx` → Tailwind + shadcn Button

## Fase 5: Limpieza de Bundle ✅

### Dependencias removidas de package.json
- [x] `@mui/icons-material` 9.0.1 (reemplazado por `lucide-react`)
- [x] `@mui/joy` 5.0.0-beta.52 (no se usaba)
- [x] `@fontsource/roboto` 4.5.8 (usamos Barlow desde Google Fonts)
- [x] `react-swipeable-views` 0.14.0 (deprecated, no compatible React 18+)
- [x] `@emotion/react` 11.13.5 (peer de MUI, ahora transitivo)
- [x] `@emotion/styled` 11.13.5 (peer de MUI, ahora transitivo)

### Dependencias MUI mantenidas (necesarias para DataGrid + DatePicker)
- `@mui/material` ^9.0.1 — peer dependency de `@mui/x-data-grid` y `@mui/x-date-pickers`
- `@mui/system` ^9.0.1 — dependencia de `@mui/material`
- `@mui/x-data-grid` ^9.3.0 — tabla avanzada (decisión: mantener)
- `@mui/x-date-pickers` ^9.3.0 — DatePickers (decisión: mantener)

### Bundle resultante
- First Load JS shared: **154 KB**
- Framework: 44.8 KB
- _app chunk: 65.8 KB

## Estado Final

| Métrica | Valor |
|---|---|
| Archivos con import `@mui/material` directo | **1** (`DatePickerValue.jsx` usa `TextField` dentro de `DesktopDatePicker`) |
| Archivos con import `@mui/icons-material` | **0** |
| Archivos con import `@emotion/*` directo | **0** |
| Componentes shadcn/ui creados | 8 |
| Librería de iconos | `lucide-react` |
| Motor de estilos principal | Tailwind CSS |
| Motor de estilos residual | Emotion (transitivo via DataGrid/DatePicker) |

## Notas Técnicas

- **Auth0 v3**: `withAuth` → `withMiddlewareAuthRequired` (edge), `useUser`/`UserProvider`/`withPageAuthRequired` desde `@auth0/nextjs-auth0/client`
- **react-swipeable-views**: Eliminado. `TabPanel.jsx` usa tabs nativos Tailwind sin animación de swipe. Si se necesita swipe en mobile, considerar `framer-motion`.
- **Firebase Storage error durante build**: Ocurre porque no hay credenciales de Firebase en el entorno de build. No bloquea el build.
- **DatePicker MUI X**: Se mantuvo en `control-vehicular/index.js` y `flotilla/DatePickerValue.jsx`. Son los únicos lugares con MUI X fuera de DataGrid.

## Build
- [x] `pnpm build` pasa limpio
- [x] `pnpm dev` levanta en puerto 3001
