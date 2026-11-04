# Guía de integración — Catálogo de Centros de Costo

## Endpoint

```
GET /api/v1/flotilla/catalogos/centros-costo
```

**Base URL:** la misma que usan hoy para `/api/v1/flotilla/empresas/get`.

---

## Headers

Mismo manejo que el resto de la app. Si el endpoint de empresas no manda `Authorization`, este tampoco lo necesita. Si sí mandan token, inclúyanlo igual.

```
Accept: application/json
```

---

## Respuesta exitosa — 200 OK

```json
{
  "status": "success",
  "data": [
    { "id": "logistica",      "name": "Logística",      "active": true, "normalized": "logistica" },
    { "id": "operaciones",    "name": "Operaciones",    "active": true, "normalized": "operaciones" },
    { "id": "comercial",      "name": "Comercial",      "active": true, "normalized": "comercial" },
    { "id": "administracion", "name": "Administración", "active": true, "normalized": "administracion" }
  ]
}
```

---

## Respuesta vacía — 200 OK

```json
{
  "status": "success",
  "data": []
}
```

> Si llega vacío, el wizard debe mostrar el select deshabilitado con un mensaje tipo "Sin opciones disponibles".

---

## Cambios en el frontend

### 1. Reemplazar el `<select>` hardcodeado en `Components/DocumentWizard/index.jsx`

**Antes (hardcodeado):**

```jsx
<select value={costCenter} onChange={e => setCostCenter(e.target.value)}>
  <option value="logistica">Logística</option>
  <option value="operaciones">Operaciones</option>
  <option value="comercial">Comercial</option>
  <option value="administracion">Administración</option>
</select>
```

**Después (desde API):**

```jsx
const { data: catalogo } = useSWR(
  `${process.env.NEXT_PUBLIC_API}/api/v1/flotilla/catalogos/centros-costo`,
  fetcher,
  { dedupingInterval: 5 * 60 * 1000 } // cachea 5 min
)

const opciones = catalogo?.status === 'success'
  ? catalogo.data.filter(c => c.active)
  : []

<select
  value={costCenter}
  onChange={e => setCostCenter(e.target.value)}
  disabled={opciones.length === 0}
>
  {opciones.length === 0 ? (
    <option value="">Sin opciones disponibles</option>
  ) : (
    opciones.map(c => (
      <option key={c.id} value={c.id}>{c.name}</option>
    ))
  )}
</select>
```

---

### 2. En edición (`pages/update/[objectId].js`)

El documento histórico puede tener un `cost_center` que ya no esté activo. El select debe mostrar todas las opciones del catálogo + el valor actual del documento, aunque esté inactivo.

```jsx
const opcionesActivas = catalogo?.status === 'success'
  ? catalogo.data.filter(c => c.active)
  : []

const valorActual = documento?.cost_center
const opcionesEdicion = [
  ...opcionesActivas,
  ...(valorActual && !opcionesActivas.some(c => c.id === valorActual)
    ? [{ id: valorActual, name: valorActual, active: false }]
    : [])
]

<select value={costCenter} onChange={...}>
  {opcionesEdicion.map(c => (
    <option key={c.id} value={c.id}>
      {c.name} {!c.active && '(inactivo)'}
    </option>
  ))}
</select>
```

---

### 3. Payload de insert/update

No cambia. Sigue enviando `cost_center` como string:

```json
{
  "type": "traslado",
  "bussiness_cost": "626e223ffe9887654db63c37",
  "client": "626e223ffe9887654db63c39",
  "cost_center": "logistica",
  "subject": "Traslado de material a obra Norte"
}
```

---

## Reglas de comportamiento

| Escenario | Comportamiento esperado |
|---|---|
| Centro activo | Se muestra en el wizard para nuevos documentos. |
| Centro inactivo | Se oculta en nuevos documentos, pero se conserva en documentos históricos. |
| `cost_center` vacío, `null` o `undefined` | Se envía `""` al backend; el select queda sin selección. |
| Catálogo vacío | Select deshabilitado, mensaje "Sin opciones disponibles". |

---

## Notas importantes

- `id` es inmutable: es el valor que se guarda en `cost_center`.
- `name` se puede editar desde backend sin afectar documentos históricos.
- `normalized` sirve para evitar duplicados tipo `Logistica`, `logística`, `LOGISTICA`. No hace falta usarlo en frontend.
- El backend no valida `cost_center` contra enum: acepta cualquier string. El frontend controla las opciones visibles.

---

## cURL de prueba

```bash
curl https://TU_API/api/v1/flotilla/catalogos/centros-costo
```

Reemplazar `TU_API` por el dominio real del backend.
