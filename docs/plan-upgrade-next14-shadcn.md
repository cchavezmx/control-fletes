# Plan de Upgrade: Next.js 12 → 14 + React 17 → 18 + shadcn/ui

> **Status:** Planificación pendiente de aprobación  
> **Objetivo:** Actualizar framework para habilitar shadcn/ui + Tailwind CSS  
> **Riesgo principal:** Auth0 v1.8 → v3 requiere cambios en rutas, env vars, middleware y hooks.

---

## 1. Hallazgos clave de investigación

### 1.1 shadcn/ui requiere React 18+
shadcn/ui no funciona con React 17. Por lo tanto **React 17 → 18 es un prerequisito bloqueante**.

### 1.2 Next.js 15 + Auth0 = complejo
- `@auth0/nextjs-auth0` v1.8 (actual) **no soporta Next.js 15**.
- Auth0 v4 es la única que soporta Next 15, pero **cambia TODO**: rutas (`/api/auth/*` → `/auth/*`), env vars renombradas, middleware reescrito, y tuvo bugs en Pages Router.
- Auth0 v3 **sí soporta Next.js 14.2.25+** con Pages Router estable.

### 1.3 MUI v6 sí soporta React 17
Pero shadcn/ui no. Si queremos shadcn, React 18 es obligatorio.

### 1.4 Recomendación de ruta
**Next.js 12 → 14.2.25 + React 17 → 18 + Auth0 v1.8 → v3**

- Más seguro que saltar directo a Next 15 + Auth0 v4.
- Next 14 + React 18 es plenamente compatible con shadcn/ui.
- Auth0 v3 tiene años de estabilidad en Pages Router.
- El salto 14 → 15 se puede hacer en el futuro con mucho menos dolor.

---

## 2. Fase 0: Upgrade de Framework (~1 semana)

### Paso 0.1 — Backup y rama
```bash
git checkout -b feat/upgrade-next14-react18
```

### Paso 0.2 — Actualizar Next.js y React
```bash
# Next.js 12.1.5 → 14.2.25 (último estable de 14.x)
pnpm add next@14.2.25 react@18.3.1 react-dom@18.3.1

# Actualizar tipos
pnpm add -D @types/react@18 @types/react-dom@18
```

**Verificaciones post-upgrade:**
- `next.config.js` → quitar `experimental.middlewarePrefetch` (ya no existe)
- `images.domains` → migrar a `images.remotePatterns` (deprecado en Next 13+)
- Revisar si `_app.js` `getInitialProps` sigue funcionando (debería, en Pages Router)

### Paso 0.3 — Actualizar Auth0 (v1.8 → v3.7.0+)

```bash
pnpm add @auth0/nextjs-auth0@3
```

**Cambios obligatorios:**

| Ahora (v1.8) | Después (v3) |
|---|---|
| `import { handleAuth } from '@auth0/nextjs-auth0'` | `import { handleAuth } from '@auth0/nextjs-auth0'` (sigue existiendo) |
| `import { withAuth } from '@auth0/nextjs-auth0/edge'` en middleware | Middleware custom o `withMiddlewareAuthRequired` |
| `withPageAuthRequired` (HOC en componentes) | Sigue existiendo, puede requerir ajustes de tipos |
| `useUser()` hook | Sigue existiendo |
| Env `AUTH0_BASE_URL` | Sigue igual en v3 |
| `AUTH0_ISSUER_BASE_URL='https://...'` | Sigue igual en v3 |
| Rutas API `/api/auth/[...auth0].js` | Sigue igual en v3 |

**Nota:** Auth0 v1.8 → v3 NO cambia rutas ni env vars (eso es v3 → v4). El upgrade v1→v3 es más suave: principalmente cambios internos de sesión, tipos TypeScript, y el edge middleware.

**Archivos a revisar:**
- `pages/api/auth/[...auth0].js`
- `middleware.js`
- `Components/Layout.jsx` (usa `withPageAuthRequired`)
- `pages/_app.js` (usa `UserProvider`)

### Paso 0.4 — Actualizar dependencias satélite

```bash
# swr v1 → v2 (mejor soporte React 18)
pnpm add swr@2

# react-toastify v8 → v10 (React 18 compatible)
pnpm add react-toastify@10

# MUI v5 → v6 (opcional, pero buen momento)
pnpm add @mui/material@6 @mui/icons-material@6 @mui/x-data-grid@6 @mui/x-date-pickers@6
# Y forzar react-is@17 (MUI v6 requiere esto para React 17/18)
pnpm add react-is@17.0.2
```

**En `package.json` agregar override:**
```json
"overrides": {
  "react-is": "^17.0.2"
}
```

### Paso 0.5 — next/image legacy
Buscar todos los usos de `next/image` con props legacy (`objectFit`, `layout`, `objectPosition`):

```bash
grep -r "objectFit\|layout=\|objectPosition" /mnt/jardin/intecsa/control-fletes/Components /mnt/jardin/intecsa/control-fletes/pages --include="*.js" --include="*.jsx"
```

En Next 13+, `Image` cambió. Se reemplazan props legacy por clases CSS (`className="object-cover"`) o `style`.

**Archivo conocido:** `Components/Appbar.jsx` línea ~338 usa `objectFit="cover"`.

### Paso 0.6 — next.config.js actualizado

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's.gravatar.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  }
}

module.exports = nextConfig
```

### Paso 0.7 — QA de build y runtime

```bash
pnpm build
pnpm dev
```

Verificar:
- Login/logout con Auth0
- Middleware de rutas públicas
- `getServerSideProps` en todas las páginas que lo usan
- Tablas DataGrid (renderizado)
- DatePickers (sin errores de locale)
- PDF preview (iframe con blob)

---

## 3. Fase 1: Instalar Tailwind + shadcn/ui (~2–3 días)

Una vez que el framework está estable en Next 14 + React 18:

```bash
# Tailwind
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn@latest init

# Componentes shadcn necesarios
npx shadcn add button input label select checkbox dialog sheet table calendar popover badge card separator skeleton stepper dropdown-menu navigation-menu tooltip accordion avatar

# Iconos
pnpm add lucide-react

# Fechas (para Calendar de shadcn)
pnpm add date-fns
```

Configurar `tailwind.config.js` con colores de marca Grupo Intecsa.

---

## 4. Fase 2: Migración de componentes (~3 semanas)

Igual que en `migration-shadcn-plan.md` pero ahora sí es viable porque tenemos React 18 + Next 14.

**Orden:**
1. Layout global (`Appbar`, `_app.js`)
2. Cards (`Dashboard`, `CardsEmpresa`)
3. Modales simples (`NewVehicle`, `NewPlan`)
4. Formularios (`control-vehicular`, `paqueterita`)
5. Wizard de Nuevo Documento (el más complejo)
6. Tablas (`TableFlotillas` → tanstack, luego `TableDocuments` editable)
7. Páginas restantes

---

## 5. Calendario Ajustado

| Semana | Trabajo | Entregable |
|---|---|---|
| **Semana 1** | Fase 0: Upgrade Next 14 + React 18 + Auth0 v3 + QA de build | App corre en Next 14, login funciona, MUI intacto. |
| **Semana 2** | Fase 1: Tailwind + shadcn. Migrar Layout, Appbar, Cards, Dashboard. | Layout shadcn funcionando. 30% de UI migrada. |
| **Semana 3** | Fase 2: Formularios, wizard, modales. Tablas simples. | Forms y wizard completos. Tablas simples en tanstack. |
| **Semana 4** | Fase 2: Tabla editable (`TableDocuments`). Fechas en todo. Limpieza MUI. | 0 imports de @mui. Build limpio. QA. |

---

## 6. Decisión pendiente del usuario

Hay dos caminos posibles. Necesito que elijas:

### Opción A: Ruta segura (recomendada)
**Next.js 14.2.25 + React 18 + Auth0 v3 + shadcn/ui**
- ✅ Auth0 estable y documentado
- ✅ Menos riesgo de breaking changes
- ✅ shadcn/ui 100% compatible
- ⚠️ No estamos en lo último (Next 15), pero es trivial migrar 14→15 después

### Opción B: Ruta bleeding edge
**Next.js 15 + React 18 + Auth0 v4 + shadcn/ui**
- ✅ Framework más moderno
- ✅ Auth0 v4 es el futuro oficial
- ⚠️ Auth0 v4 cambia rutas, env vars, middleware (reescritura grande)
- ⚠️ Bug conocido reciente en Pages Router con v4
- ⚠️ Esfuerzo ~2x en la fase 0

---

**Mi recomendación:** Opción A. Es la diferencia entre 1 semana de upgrade de framework vs 2–3 semanas. Y Next 14 no es viejo; muchas empresas productivas corren en 14.

¿Con cuál arrancamos?
