# Plan de Migración V2: Tailwind CSS + shadcn/ui

## Resumen Ejecutivo
Migración del sistema de Material UI v5 + Emotion a Tailwind CSS + Radix UI + shadcn/ui. Modernización completa del stack de UI manteniendo funcionalidad y mejorando DX.

## Estado Actual
| Aspecto | Valor |
|---------|-------|
| Framework | Next.js 12.1.5 |
| React | 17.0.2 |
| UI Library | Material UI v5 (@mui/material, @mui/joy) |
| Styling | Emotion + CSS global |
| Componentes | ~30 componentes JSX personalizados |
| Autenticación | Auth0 (@auth0/nextjs-auth0) |
| Bundle | ~982MB (sin optimizar) |

## Target Stack V2
| Aspecto | Valor |
|---------|-------|
| Framework | Next.js 15 (App Router opcional) |
| React | 18+ |
| UI Library | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Componentes | Radix primitives + shadcn/ui registry |
| Icons | Lucide React |
| Forms | React Hook Form + Zod (ya existe) |

## Fases de Migración

### Fase 1: Setup y Configuración (1-2 días)
1. Instalar dependencias Tailwind + shadcn
2. Configurar `tailwind.config.ts`
3. Inicializar shadcn/ui
4. Migrar `globals.css` a Tailwind
5. Crear layout base con Tailwind

### Fase 2: Componentes Base (3-4 días)
1. Instalar shadcn components: button, input, card, dialog, sheet
2. Componente `Button` (reemplazar MUI Button)
3. Componente `Input` (reemplazar MUI TextField)
4. Componente `Card` (reemplazar MUI Card)
5. Componente `Dialog` (reemplazar MUI Modal/Dialog)
6. Componente `Sheet` (reemplazar MUI Drawer)
7. Componente `AppBar` (reemplazar MUI AppBar)
8. Componente `Select` (reemplazar MUI Select)
9. Componente `Table` (reemplazar MUI DataGrid)

### Fase 3: Migración de Páginas (5-7 días)
1. `Layout.jsx` → Nuevo layout con Tailwind
2. `Appbar.jsx` → `AppBar` con Sheet para drawer
3. `pages/index.js` → Dashboard con Tailwind
4. `pages/flotilla/*` → Migrar tablas y forms
5. `pages/vehicles/*` → Migrar forms y cards
6. `pages/mantenimiento/*` → Migrar tablas
7. `pages/paqueterita/*` → Migrar shipping grid
8. `pages/shipping/*` → Migrar paquetería

### Fase 4: Estilos y Optimización (2 días)
1. Migrar tema MUI → Tailwind config
2. Migrar colores custom → CSS variables
3. Revisar responsive (sx props → Tailwind classes)
4. Limpiar dependencias MUI
5. Testing y QA

### Fase 5: Depuración (1 día)
1. Eliminar @mui/* de package.json
2. Eliminar @emotion/* de package.json
3. Verificar bundle size
4. Documentación final

## Componentes MUI → shadcn/ui Mapping

| MUI Component | shadcn/ui Equivalent | Comando Install |
|---------------|---------------------|-----------------|
| Button | button | `npx shadcn add button` |
| TextField | input | `npx shadcn add input` |
| Card | card | `npx shadcn add card` |
| Dialog | dialog | `npx shadcn add dialog` |
| Drawer | sheet | `npx shadcn add sheet` |
| AppBar | custom + navigation-menu | `npx shadcn add navigation-menu` |
| Select | select | `npx shadcn add select` |
| DataGrid | table | `npx shadcn add table` |
| IconButton | button (variant="ghost") | - |
| Badge | badge | `npx shadcn add badge` |
| Menu | dropdown-menu | `npx shadcn add dropdown-menu` |
| Divider | separator | `npx shadcn add separator` |
| List | custom divs | - |
| Toolbar | custom header | - |
| Typography | Tailwind typography | - |
| Container | custom div max-w classes | - |
| Box | div con Tailwind | - |
| Grid | CSS Grid / Flexbox | - |
| Tabs | tabs | `npx shadcn add tabs` |
| Modal | dialog | - |
| Drawer | sheet | - |
| Stepper | custom | - |
| Snackbar | Sonner | `npx shadcn add sonner` |
| Tooltip | tooltip | `npx shadcn add tooltip` |
| Avatar | avatar | `npx shadcn add avatar` |
| CircularProgress | custom | - |
| Skeleton | skeleton | `npx shadcn add skeleton` |

## Estructura de Archivos Destino

```
control-fletes-v2/
├── src/
│   ├── app/                    # Next.js App Router (opcional)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── table.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppBar.tsx      # Navigation
│   │   │   ├── Sidebar.tsx
│   │   │   └── RootLayout.tsx
│   │   └── [pages]/
│   ├── lib/
│   │   ├── utils.ts            # cn() helper
│   │   └── api.ts              # API clients
│   └── hooks/
│       └── useAuth.ts
├── components.json             # shadcn config
├── tailwind.config.ts
├── postcss.config.mjs
└── package.json
```

## Instalación Paso a Paso

```bash
# 1. Backup del proyecto actual
cp -r control-fletes control-fletes-backup

# 2. Instalar Tailwind CSS v4
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Inicializar shadcn/ui
npx shadcn@latest init --yes --template next --base-color slate

# 4. Instalar componentes esenciales
npx shadcn add button input card dialog sheet table select badge dropdown-menu separator tabs sonner tooltip avatar skeleton navigation-menu

# 5. Instalar dependencias adicionales
npm install lucide-react clsx tailwind-merge

# 6. Migrar React 17 → 18
npm install react@18 react-dom@18
```

## Breaking Changes Esperados

1. **Pages Router → App Router**: Opcional, puede mantenerse Pages
2. **Emotion sx prop → Tailwind classes**: Mayor cambio manual
3. **MUI theme → Tailwind config**: Necesita mapear colores
4. **Form controllers MUI → Form nativo + shadcn**
5. **DataGrid MUI → Table shadcn + custom logic**

## Criterios de Aceptación

- [ ] Todos los componentes renderizan correctamente
- [ ] No hay errores de consola
- [ ] Responsive funciona igual o mejor
- [ ] Bundle size reducido >30%
- [ ] Tiempo de build < 3 minutos
- [ ] Auth0 sigue funcionando
- [ ] Formularios validan con Zod
- [ ] Tests pasan (si existen)

## Rollback Plan
```bash
# Si falla, restaurar backup
cp -r control-fletes-backup/* control-fletes/
```

## Estimación Total
| Fase | Tiempo |
|------|--------|
| Setup + Config | 1-2 días |
| Componentes Base | 3-4 días |
| Migración Páginas | 5-7 días |
| Optimización | 2 días |
| Depuración | 1 día |
| **Total** | **12-16 días** |

## Notas Técnicas

### Theme MUI → Tailwind
```js
// MUI Theme actual
theme = {
  typography: { fontFamily: 'Barlow, Arial', fontSize: 16 },
  palette: {
    primary: { main: '#3f51b5' },  // Logística
    secondary: { main: '#461e59' }, // Sistemas
    orange: { main: '#FF8C00' }  // Inventario
  }
}

// Tailwind config equivalente
theme: {
  extend: {
    fontFamily: { sans: ['Barlow', 'Arial', 'sans-serif'] },
    colors: {
      logistica: '#3f51b5',
      sistemas: '#461e59',
      inventario: '#FF8C00'
    }
  }
}
```

### Iconos: MUI → Lucide
```jsx
// Antes (MUI)
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'

// Después (Lucide)
import { Menu, Home } from 'lucide-react'
```

## Archivos de Migración Generados

Ver directorio `/migration-v2/` para:
- `tailwind.config.ts`
- `components.json`
- `globals.css` (v2)
- Componentes migrados base
- Scripts de migración
