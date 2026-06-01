# Plan de Migración: Material UI → shadcn/ui + Tailwind CSS

> **Proyecto:** flotillas-ita (Next.js 12 + React 17 + MUI v5)  
> **Objetivo:** Rediseño visual completo migrando de MUI a shadcn/ui + Tailwind CSS  
> **Estimación total:** 4–6 semanas de trabajo dedicado (frontend) + 1 semana backend/QA  
> **Riesgo principal:** Next.js 12 + React 17 NO son compatibles con shadcn/ui moderno. El upgrade de framework es obligatorio y bloqueante.

---

## 0. Análisis de Alcance Actual

| Métrica | Valor |
|---|---|
| Archivos de componentes/páginas | 42 |
| Líneas de imports `@mui/**` | 85+ |
| Archivos con `@mui/icons-material` | 5 |
| Archivos con `DataGrid` (MUI X) | 3 (`TableFlotillas`, `TableDocuments`, `ShippingGrid`) |
| Archivos con `DatePicker` (MUI X) | 3 (`NewDocument`, `DatePickerValue`, `control-vehicular`) |
| ThemeProvider + createTheme global | 1 (`_app.js`) |
| Motor de estilos | Emotion (`@emotion/react`, `@emotion/styled`) |
| Versión Next.js | 12.1.5 |
| Versión React | 17.0.2 |

**Componentes MUI críticos a reemplazar:**
- `DataGrid` (tablas con edición inline, filtros, checkbox selection, row actions)
- `DatePicker` / `LocalizationProvider` / `AdapterDayjs`
- `Drawer` (menú lateral, formularios)
- `Modal` (varios: NewVehicle, NewPlan, EditVehicle, PrevPDF, etc.)
- `Select`, `TextField`, `Checkbox`, `Button`, `Typography`, `Box`, `Grid`
- `Stepper`, `Accordion` (nuestro wizard de Nuevo Documento)
- `Chip`, `Collapse`, `Divider`, `Container`, `AppBar`, `Toolbar`
- `Skeleton`, `Paper`, `Badge`, `Menu`, `MenuItem`, `List`, `ListItem`
- `Slider`, `FormControl`, `FormHelperText`, `FormControlLabel`

---

## 1. Fase 0: Upgrade de Framework (OBLIGATORIO — ~1 semana)

shadcn/ui requiere **React 18+** y **Next.js 13+** (idealmente 14+). El proyecto actual está en Next.js 12 + React 17.

### 1.1 Next.js 12 → 15 + React 17 → 19

```bash
# 1. Actualizar core
pnpm add next@latest react@latest react-dom@latest

# 2. Revisar breaking changes
# Next.js 12 → 13: App Router opcional, pero _app.js sigue funcionando en Pages Router
# Next.js 13 → 14: mínimo breaking
# Next.js 14 → 15: cambios en caching, fetch por defecto
```

**Riesgos:**
- `next/image` legacy → nuevo componente `Image` (sin `objectFit`, `layout`, etc.)
- `_app.js` `getInitialProps` puede romperse en dev con React 18 Strict Mode
- `@auth0/nextjs-auth0` v1.8.0 → verificar compatibilidad con Next.js 15
- `next.config.js` → `next.config.mjs` o ajustar opciones deprecadas
- `middleware.js` (edge) → verificar que siga funcionando

### 1.2 ESLint / Standard

```bash
pnpm add -D eslint-config-next@latest
```

### 1.3 Limpiar dependencias obsoletas

Eliminar tras la migración:
- `@emotion/react`
- `@emotion/styled`
- `@mui/material`
- `@mui/joy`
- `@mui/icons-material`
- `@mui/x-data-grid`
- `@mui/x-date-pickers`
- `@fontsource/roboto`
- `react-swipeable-views` (ya estaba en la app, aunque no lo usamos ahora)

---

## 2. Fase 1: Instalación de Tailwind + shadcn/ui (~2–3 días)

### 2.1 Tailwind CSS

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configurar `tailwind.config.js` con el tema de marca de Grupo Intecsa (colores, tipografía Barlow).

### 2.2 shadcn/ui CLI

```bash
npx shadcn@latest init
```

Esto configura:
- `components.json`
- Alias de imports (`@/components`, `@/lib/utils`)
- `cn()` helper (clsx + tailwind-merge)

### 2.3 Instalar componentes shadcn necesarios

```bash
# Core (formularios, layout)
npx shadcn add button input label select checkbox dialog sheet

# Tablas (reemplazo de DataGrid)
npx shadcn add table data-table

# Navegación y feedback
npx shadcn add tabs badge card separator skeleton

# Stepper (wizard)
npx shadcn add stepper

# Dropdowns y menús
npx shadcn add dropdown-menu navigation-menu

# Fechas (reemplazo de DatePicker)
npx shadcn add calendar popover

# Otros
npx shadcn add tooltip toast sonner accordion avatar
```

**Nota sobre tablas:** shadcn/ui NO tiene un `DataGrid` con edición inline nativa como MUI X. Se necesita `@tanstack/react-table` (ya es la base del `data-table` de shadcn). La tabla editable requiere trabajo custom significativo.

**Nota sobre fechas:** shadcn/ui usa `date-fns` + `react-day-picker` bajo el componente `Calendar`. La UX es diferente a MUI X DatePicker. Si se necesita calendario en español, configurar locale de `date-fns`.

### 2.4 Iconos

Reemplazar `@mui/icons-material` por `lucide-react` (la librería estándar de shadcn/ui):

```bash
pnpm add lucide-react
```

Mapeo común:
| MUI | Lucide |
|---|---|
| `MenuIcon` | `Menu` |
| `HomeIcon` | `Home` |
| `AccountCircle` | `UserCircle` |
| `LocalShippingIcon` | `Truck` |
| `SettingsIcon` | `Settings` |
| `ExpandMoreIcon` | `ChevronDown` |
| `ArrowBackIcon` | `ArrowLeft` |
| `ArrowForwardIcon` | `ArrowRight` |
| `LocalGasStationIcon` | `Fuel` |
| `AddCircleIcon` | `CirclePlus` |
| `Inventory2Icon` | `Package` |
| `KeyboardReturnIcon` | `Undo2` |
| `RemoveRedEyeIcon` | `Eye` |
| `MailIcon` | `Mail` |
| `NotificationsIcon` | `Bell` |
| `MoreIcon` | `MoreVertical` |
| `GpsFixedIcon` | `MapPin` |
| `MarkunreadMailboxIcon` | `Mailbox` |
| `LaptopChromebookIcon` | `Laptop` |
| `DirectionsCarFilledIcon` | `Car` |

---

## 3. Fase 2: Migración de Componentes Base (~1 semana)

Estrategia recomendada: **bottom-up**. Empezar por los componentes más atómicos y reutilizables, luego subir a páginas.

### 3.1 Layout global (`_app.js`, `Layout.jsx`, `Appbar.jsx`)

- Reemplazar `ThemeProvider` de MUI por Tailwind CSS puro
- Crear un `globals.css` con variables CSS de marca
- Reescribir `Appbar` con clases de Tailwind y componentes shadcn (`NavigationMenu`, `Sheet` para mobile)
- `Container` de MUI → contenedores de Tailwind (`max-w-7xl mx-auto px-4`)

### 3.2 Cards y presentación

- `CardsEmpresa.jsx`: MUI `Card` → shadcn `Card` con Tailwind
- `CardVehicles.jsx` (si revive): idem
- `Dashboard.jsx`: Skeletons de MUI → Skeleton de shadcn

### 3.3 Formularios simples

- `TextField` → `Input` de shadcn + `Label`
- `Select` → `Select` de shadcn (`@radix-ui/react-select`)
- `Checkbox` → `Checkbox` de shadcn
- `Button` → `Button` de shadcn (variantes: default, destructive, outline, secondary, ghost, link)
- `Typography` → clases de Tailwind (`text-sm`, `text-lg`, `font-bold`, etc.)
- `Box` / `Grid` → `div` con clases de Tailwind (`flex`, `grid`, `gap-4`, etc.)

### 3.4 Feedback y utilidades

- `toast` de `react-toastify` → `sonner` de shadcn (mejor integración con Tailwind)
- `Modal` de MUI → `Dialog` de shadcn (`@radix-ui/react-dialog`)
- `Drawer` de MUI → `Sheet` de shadcn (lateral) o seguir usando `Dialog`
- `Collapse` → clases Tailwind (`overflow-hidden transition-all`)
- `Divider` → `Separator` de shadcn o `<hr className="border-gray-200" />`

---

## 4. Fase 3: Migración de Componentes Complejos (~1.5–2 semanas)

### 4.1 Tablas (RIESGO ALTO — la parte más difícil)

MUI X `DataGrid` tiene funcionalidades que shadcn/ui no cubre out-of-the-box:
- Edición inline de celdas (`renderEditCell`, `onCellEditCommit`)
- Checkbox de selección múltiple con `onSelectionModelChange`
- `GridToolbar` (filtros, columnas, export)
- Paginación server-side / client-side
- `getRowClassName` (colores condicionales por fila)
- `localeText` en español

**Opciones:**

**A) `@tanstack/react-table` + shadcn `data-table` (recomendado)**
- Ventaja: estándar de la industria, muy flexible
- Desventaja: requiere reimplementar edición inline, selección, toolbar
- Esfuerzo: ~3–4 días por tabla (tenemos 3 tablas principales)

**B) Mantener MUI X DataGrid solo para tablas (híbrido)**
- Ventaja: cero esfuerzo en tablas
- Desventaja: se queda Emotion + MUI en el bundle, incoherencia visual
- No recomendado si el objetivo es "salir de MUI"

**C) Librería alternativa de tablas** (ej. `ag-grid` tiene tema con Tailwind)
- Ventaja: DataGrid más potente que MUI X
- Desventaja: aprendizaje, bundle grande, puede requerir licencia

**Decisión recomendada: Opción A.**

Plan para `TableFlotillas` (la más simple):
1. Crear columna definitions con `@tanstack/react-table`
2. Implementar checkbox selection con estado local
3. Renderizar celdas con clases Tailwind
4. Agregar sorting, pagination (client-side primero)

Plan para `TableDocuments` (la más compleja):
1. Reimplementar todas las `renderCell` con inputs inline (`Input` de shadcn)
2. Manejar `onBlur` / `onKeyDown` para guardar cambios
3. Reemplazar `Select` dentro de celdas por `Popover` + `Command` (combobox)
4. Reemplazar `DatePickerValue` dentro de celdas por `Popover` + `Calendar`
5. Implementar `GridToolbar` con dropdowns de shadcn

### 4.2 Fechas

Reemplazar `LocalizationProvider` + `DatePicker` (MUI X) por:
- `Popover` + `Calendar` de shadcn/ui
- `date-fns` con locale `es`

Esto afecta:
- `NewDocument.jsx` (wizard de 5 pasos)
- `control-vehicular/index.js` (formulario de salida)
- `TableDocuments.jsx` (edición inline de fechas en celdas)

### 4.3 Stepper / Wizard

Ya reescribimos `NewDocument` con MUI `Stepper`. En shadcn/ui:
- shadcn tiene `Stepper` (en registry, no en core)
- O implementar custom con clases Tailwind
- Alternativa: librería `stepperize` o custom con flex + circles

### 4.4 Slider de combustible

`FuelLevelSlider` usa MUI `Slider`. Reemplazar por:
- `input type="range"` con clases Tailwind (más ligero)
- O instalar un componente slider de Radix (`@radix-ui/react-slider`) que ya es la base de shadcn

---

## 5. Fase 4: Migración de Páginas (~1 semana)

Orden recomendado (de menor a mayor complejidad):

1. **`/paqueterita`** (formulario público simple)
2. **`/shipping`** (tabla simple de paquetería)
3. **`/control-vehicular`** (formulario con DatePickers y Slider)
4. **`/ita-utils`** (formulario simple de Firebase)
5. **`/newvehicleslist`** (tabla editable compleja)
6. **`/[empresaId]`** (vista principal con Toolbar colapsable + TabPanel)
7. **`/` (Dashboard)** (cards simples, buen caso de prueba)

Cada página:
- Reemplazar imports MUI por shadcn/Tailwind
- Revisar hooks (`useUser` de Auth0 no cambia)
- Revisar fetchers SWR (no cambian)
- Ajustar clases de layout

---

## 6. Fase 5: Limpieza y Bundle (~2–3 días)

- Eliminar todas las dependencias MUI de `package.json`
- Eliminar configuraciones de Emotion si quedan
- Eliminar `globals.css` legacy de MUI
- Revisar `_document.js` si se tocó para Emotion SSR
- Auditar bundle con `@next/bundle-analyzer`
- Tree-shaking de Lucide (importar iconos individuales)

---

## 7. Calendario Sugerido (4 semanas intensivas)

| Semana | Foco | Entregable |
|---|---|---|
| **Semana 1** | Fase 0: Upgrade Next.js 15 + React 19. Instalar Tailwind + shadcn. Migrar Layout + Appbar. | App corre en Next 15. Layout global sin MUI. |
| **Semana 2** | Fase 2: Componentes base. Fase 3: Tablas (TableFlotillas + ShippingGrid). | 70% de componentes atómicos migrados. Tablas simples funcionando. |
| **Semana 3** | Fase 3: Tabla compleja (TableDocuments). Fechas en todos los forms. Stepper en wizard. | Tabla editable funcionando. Wizard de 5 pasos en shadcn. |
| **Semana 4** | Fase 4: Páginas restantes. Fase 5: Limpieza de bundle. QA visual. | 0 imports de @mui. Build limpio. QA aprobado. |

---

## 8. Costos y Recursos

| Ítem | Estimación |
|---|---|
| Desarrollador frontend senior | 4–5 semanas full-time |
| QA / regresión visual | 3–5 días |
| Diseñador UI (si se aprovecha para rediseño de marca) | 1–2 semanas (paralelo) |
| Riesgo de bloqueo por bugs de upgrade Next.js | +2–3 días buffer |
| **Total estimado** | **~5–6 semanas** |

---

## 9. Alternativas menos radicales (si el timeline no da)

### Opción A: MUI v6 + Tailwind (híbrido)
MUI v6 (la última) permite desactivar Emotion y usar Tailwind CSS como motor de estilos. Así se mantiene la funcionalidad completa de DataGrid, DatePickers, etc., pero con la estética y utilidades de Tailwind.

- Esfuerzo: **1 semana** (update de MUI, configurar Tailwind, reescribir theme)
- Ventaja: cero reescritura de tablas, fechas, stepper
- Desventaja: sigues dependiendo de MUI

### Opción B: Rediseño progresivo (shadcn solo en nuevas features)
Dejar las vistas actuales en MUI y construir nuevas funcionalidades (dashboard v2, reportes, config) con shadcn/ui. Cuando una vista antigua necesite rework mayor, se migra entonces.

- Esfuerzo: **0 semanas** upfront, pero forever hybrid
- Ventaja: cero downtime, cero riesgo
- Desventaja: dos sistemas de diseño coexisten

---

## 10. Decisiones Pendientes

1. **¿Hacemos el upgrade de Next.js 15 primero, o es un proyecto aparte?**
   - Recomendación: proyecto aparte, de 3–4 días, mergeado antes de tocar shadcn.

2. **¿DataGrid de tanstack o ag-grid?**
   - Recomendación: tanstack/react-table (más ligero, usado por shadcn nativamente).

3. **¿Sonner (toast) o seguimos con react-toastify?**
   - Sonner se integra mejor visualmente con shadcn, pero react-toastify sigue funcionando.

4. **¿Rediseñamos la paleta de colores aprovechando?**
   - Idealmente sí. shadcn/ui permite un `themes.json` con CSS variables. Es el momento de definir la marca.

5. **¿App Router o seguimos en Pages Router?**
   - shadcn/ui funciona en ambos. Recomendación: **seguir en Pages Router** para no abrir otro frente. Migrar a App Router es otro proyecto de 2+ semanas.
