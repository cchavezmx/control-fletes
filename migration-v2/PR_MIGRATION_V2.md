# PR de Migración V2: Tailwind CSS + shadcn/ui

## Resumen
Migración completa del sistema de **Material UI v5 + Emotion** a **Tailwind CSS v4 + Radix UI + shadcn/ui**. Esta PR moderniza todo el stack de UI manteniendo funcionalidad existente.

## Cambios Principales

### 1. Setup y Configuración
- ✅ Tailwind CSS v4 configurado
- ✅ shadcn/ui inicializado con tema custom
- ✅ Configuración de colores INTECSA (logistica, sistemas, inventario)
- ✅ Tipografía Barlow (font-family consistente)

### 2. Componentes Base MUI → shadcn/ui

| MUI Component | Nuevo shadcn/ui | Estado |
|---------------|-----------------|--------|
| Button | `button.tsx` | ✅ Creado |
| TextField | `input.tsx` | ✅ Creado |
| Card | `card.tsx` | ✅ Creado |
| Dialog | `dialog.tsx` | ⏳ Pendiente |
| Drawer | `sheet.tsx` | ⏳ Pendiente |
| AppBar | `AppBar.tsx` | ⏳ Pendiente |
| Select | `select.tsx` | ⏳ Pendiente |
| DataGrid | `table.tsx` | ⏳ Pendiente |
| Tabs | `tabs.tsx` | ⏳ Pendiente |
| Snackbar | `sonner.tsx` | ⏳ Pendiente |
| Badge | `badge.tsx` | ⏳ Pendiente |
| Menu | `dropdown-menu.tsx` | ⏳ Pendiente |
| Avatar | `avatar.tsx` | ⏳ Pendiente |
| Separator | `separator.tsx` | ⏳ Pendiente |
| Skeleton | `skeleton.tsx` | ⏳ Pendiente |
| Tooltip | `tooltip.tsx` | ⏳ Pendiente |

### 3. Dependencias Actualizadas

**Eliminadas:**
- `@mui/material`
- `@mui/joy`
- `@mui/icons-material`
- `@mui/x-data-grid`
- `@mui/x-date-pickers`
- `@emotion/react`
- `@emotion/styled`

**Añadidas:**
- `tailwindcss`
- `@radix-ui/*` (primitives)
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`
- `sonner`
- `tailwindcss-animate`

### 4. Actualizaciones de Framework
- Next.js 12.1.5 → 15.1.0
- React 17.0.2 → 18.x
- `@auth0/nextjs-auth0` 1.8.0 → 3.5.0

## Estructura de Archivos

```
migration-v2/
├── tailwind.config.ts          # Config Tailwind con colores INTECSA
├── components.json             # Config shadcn/ui
├── globals.css                  # CSS base con variables HSL
├── package.json                 # Dependencies V2
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   ├── layout/
│   │   │   ├── AppBar.tsx      # (por crear)
│   │   │   └── Sidebar.tsx
│   └── lib/
│       └── utils.ts            # cn() helper
└── scripts/
    └── migrate-styles.js       # Script de migración automática
```

## Tema INTECSA

### Paleta de Colores
```js
colors: {
  logistica: { DEFAULT: "#3f51b5", foreground: "#ffffff" },
  sistemas: { DEFAULT: "#461e59", foreground: "#ffffff" },
  inventario: { DEFAULT: "#FF8C00", foreground: "#ffffff" }
}
```

### Rutas → Colores
- `/` y flotilla → `logistica` #3f51b5
- `/mantenimiento` → `sistemas` #461e59
- `/inventarioti` → `inventario` #FF8C00

## Testing Checklist

### Funcionalidad
- [ ] Login con Auth0 funciona
- [ ] Todas las rutas cargan sin errores
- [ ] Forms validan con Zod
- [ ] Firebase queries funcionan
- [ ] Google Maps API carga
- [ ] Modales/drawers se abren/cierran
- [ ] Tablas renderizan datos
- [ ] Selects funcionan

### Estilos
- [ ] Responsive funciona en mobile
- [ ] Colores de rutas cambian correctamente
- [ ] Hover states funcionan
- [ ] Focus rings visibles
- [ ] Dark mode no rompe (opcional)

### Performance
- [ ] Bundle size reducido >30%
- [ ] Lighthouse score >80
- [ ] No hay CLS

## Como Implementar

### Paso 1: Backup
```bash
cp -r control-fletes control-fletes-backup-v1
```

### Paso 2: Instalar Dependencias V2
```bash
npm install
```

### Paso 3: Migrar Archivos
```bash
# Copiar configs
cp migration-v2/tailwind.config.ts .
cp migration-v2/components.json .
cp migration-v2/globals.css src/app/
cp migration-v2/package.json .

# Instalar dependencias
npm install
```

### Paso 4: Instalar Componentes shadcn
```bash
npx shadcn add button input card dialog sheet table select badge dropdown-menu separator tabs sonner tooltip avatar skeleton navigation-menu
```

### Paso 5: Migrar Componentes Manualmente
Ver `migration-v2/MIGRATION_GUIDE.md` para instrucciones detalladas de cada componente.

### Paso 6: Testing
```bash
npm run dev
npm run build
```

## Rollback

```bash
# Restaurar backup
cp -r control-fletes-backup-v1/* control-fletes/
npm install
```

## Notas de Implementación

### sx Prop → Tailwind Classes
Antes (MUI):
```jsx
<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
```

Después (Tailwind):
```jsx
<div className="flex-grow hidden md:flex">
```

### Theme Provider → CSS Variables
El tema MUI ahora vive en `globals.css` como CSS variables HSL, accedidos via Tailwind classes.

### Responsive Breakpoints
Manteníamos los breakpoints de Mobile First:
- xs: default
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## Review Checkpoints

- @reviewer verificar que AppBar funciona correctamente
- @reviewer revisar forms de crear/editar vehículos
- @reviewer probar tablas DataGrid en flotilla
- @reviewer validar responsive en mobile

## Screenshots Esperados

1. Dashboard - Desktop
2. Dashboard - Mobile
3. Tabla Flotillas
4. Modal Editar Vehículo
5. Drawer Sidebar
6. Página Login

## Relacionado

- Issue #XX: Modernización UI
- Issue #XX: Reducir bundle size

---

**Breaking Changes:**
- Elimina Material UI completamente
- Classes sx prop ya no funcionan
- Tema MUI no existe más (usa shadcn theme)
- Iconos MUI → Lucide React

**Migración recomendada:** Branch por fases, no todo en una PR.
