# PDF Payload Spec — `POST /vehicle-invoice/`

> **Status:** Contrato activo. El backend `api-control-inventario` (`services/PDFServices.js#vehicleData`) forwardea este payload al servicio externo de PDF.
> **Cambios recientes (Round 2):** se agregan `pre_flight` (bloque revisión de unidad), `profit_pct`, `indirect_pct`, `cargo_description` top-level. `subtotal_travel` ahora viaja como `Number` (no string).
> **Renueva:** `docs/backend-requirements.md` §4, §6, §10, §11

---

## 1. Endpoint

```
POST ${PDF_SERVICE}/vehicle-invoice/
Content-Type: application/json
```

El backend actual (`FlotillasController.printPlan`) hace `axios.post` con `responseType: 'arraybuffer'` y reenvía el `application/pdf` al cliente.

---

## 2. Payload completo (round 2)

```json
{
  "type": "RENTA",
  "isCancel_status": "",
  "currentEmpresa": "INSTALACIONES TECNOLÓGICAS APLICADAS",
  "folio": 1,
  "created_day": "martes, 1 de julio de 2025",
  "request_day": "martes, 1 de julio de 2025",
  "delivery_day": "martes, 15 de julio de 2025",
  "currentClient": "INSTALACIONES TECNOLÓGICAS APLICADAS",
  "subject": "Renta de unidad para obra Neiboruga",
  "vehicle": {
    "name": "Toyota Hilux",
    "placas": "XYZ123",
    "driver": "Juan Pérez García",
    "fuel_card": "TC-8847",
    "fuel_amount": "$2,500.00"
  },
  "route": "Cd. Obregón - Hermosillo - Cd. Obregón",
  "kilometer_out": 87500,
  "fuel_level": 75,
  "recorrido_km": "420",
  "subtotal_travel": "$17,800.00",
  "description": {
    "link_googlemaps": "https://maps.app.goo.gl/abc123",
    "project_id": "PRY-NEB-2025-Q3",
    "document_id": "SAL-2025-001",
    "planPrice": "$17,800.00",
    "planDescription": "Incluye operador, combustible base y viáticos"
  },
  "cost_breakdown": {
    "casetas_amount": 1200,
    "operator_rate": 839.22,
    "operator_days": 14,
    "per_diem_rate": 307.80,
    "per_diem_days": 14,
    "gasoline_rate": 5.00,
    "gasoline_km": 420,
    "unit_rent_amount": 17800.00,
    "unit_rent_period": "semana",
    "profit_amount": 666.16,
    "indirect_amount": 999.24
  },
  "pre_flight": {
    "fuel_level": 75,
    "cargo_description": "28 ton perfiles de acero",
    "items": {
      "extintor": true,
      "llanta_refaccion": true,
      "herramientas": true,
      "gato": true,
      "cinturon": true,
      "documentos": true,
      "tarjetas": true
    },
    "observaciones": "Sin golpes visibles. Tarjeta TC-8847 con saldo."
  },
  "profit_pct": 8,
  "indirect_pct": 12,
  "cargo_description": "28 ton perfiles de acero",
  "origin": "CODI CDMX",
  "destination": "GUADALAJARA",
  "stops": ["iztapalapa", "ecatepec"],
  "cost_center": "comercial",
  "notes": "Entrega urgente"
}
```

---

## 3. Referencia de campos (todos los del payload)

### 3.1 Top-level

| Campo | Tipo | Requerido | Default | Notas |
|---|---|---|---|---|
| `type` | string | sí | — | Siempre en MAYÚSCULAS. Uno de: `"RENTA"`, `"FLETE"`, `"TRASLADO"`. |
| `isCancel_status` | string | no | `""` | Estado de cancelación. `""` = activo. |
| `currentEmpresa` | string | sí | — | Nombre de la empresa que crea el doc, en MAYÚSCULAS. Lookup desde `empresaLogos` por `bussiness_cost`. |
| `currentClient` | string | sí | — | Nombre del cliente, en MAYÚSCULAS. Lookup desde `empresaLogos` por `client`. |
| `folio` | number | sí | — | Folio del documento (autoincremental por empresa). |
| `created_day` | string | sí | — | Fecha de creación formateada (es-MX, `dateStyle: "full"`). |
| `request_day` | string | sí | — | Fecha de solicitud formateada. |
| `delivery_day` | string | sí | — | Fecha de dispersión/entrega formateada. |
| `subject` | string | no | `""` | Asunto del documento. |
| `route` | string \| object | no | `""` | Ruta. Formato variable (string o JSON). |
| `kilometer_out` | number (int) | no | 0 | Kilometraje de salida. |
| `fuel_level` | number (0-100) | no | 0 | Nivel de combustible al salir. Validado en schema. |
| `recorrido_km` | string | no | `"0"` | Distancia recorrida estimada (km). |
| `subtotal_travel` | **string formateado** | no | `"$0.00"` | **Importante:** ya viene con formato `Intl.NumberFormat` (`"$17,800.00"`). Usar como string en modo legacy. En modo desglose se ignora. |
| `vehicle` | object | sí | — | Ver §3.2. |
| `description` | object | no | `{}` | Ver §3.3. |
| `cost_breakdown` | object | no | `{}` | Ver §3.4. Si ausente, render legacy. |
| `pre_flight` | object | no | `{}` | Ver §3.5. Si ausente, omitir bloque. |
| `profit_pct` | number | no | 8 | Porcentaje de utilidad. |
| `indirect_pct` | number | no | 12 | Porcentaje de indirectos. |
| `cargo_description` | string | no | `""` | Descripción de la carga. **Redundante** con `pre_flight.cargo_description` — preferir top-level si ambos vienen. |
| `origin` | string | no | `""` | Origen del viaje (Texto libre del wizard StepRuta). |
| `destination` | string | no | `""` | Destino del viaje. |
| `stops` | array of strings | no | `[]` | Paradas intermedias. |
| `cost_center` | string | no | `""` | Centro de costo (`comercial`, `admin`, etc). |
| `notes` | string | no | `""` | Notas libres. |

### 3.2 `vehicle`

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | Modelo del vehículo. Default `"Sin modelo"`. |
| `placas` | string | Placas. Default `"Sin placas"`. |
| `driver` | string | Nombre del conductor. |
| `fuel_card` | string | Tarjeta de combustible. |
| `fuel_amount` | **string formateado** | Monto de carga de gasolina. Formato `Intl.NumberFormat` (`"$2,500.00"`). |

### 3.3 `description`

| Campo | Tipo | Notas |
|---|---|---|
| `link_googlemaps` | string | URL del recorrido. |
| `project_id` | string | ID del proyecto. |
| `document_id` | string | ID de salida de almacén. |
| `planPrice` | **string formateado** | Precio del plan (`"$5,800.00"`). **Duplica `subtotal_travel` actualmente** (mismo valor). |
| `planDescription` | string | Descripción del plan. Default `"Sin descripción"`. |

### 3.4 `cost_breakdown` (desglose de conceptos)

| Campo | Tipo | Requerido | Default | Notas |
|---|---|---|---|---|
| `casetas_amount` | number | no | 0 | Monto fijo casetas. |
| `casetas_unit` | string | no | `"fijo"` | Unidad del monto casetas (`"fijo"`, `"km"`, etc). |
| `casetas_notes` | string | no | `""` | Notas del operador sobre casetas. |
| `operator_rate` | number | no | 0 | Tarifa operador (MXN/unidad). |
| `operator_unit` | string | no | `"dia"` | Unidad del operador (`"dia"`, `"hora"`, `"turno"`). |
| `operator_days` | number (int) | no | 0 | Cantidad de unidades operador. |
| `per_diem_rate` | number | no | 0 | Tarifa viáticos. |
| `per_diem_unit` | string | no | `"dia"` | Unidad viáticos. |
| `per_diem_days` | number (int) | no | 0 | Cantidad de unidades viáticos. |
| `gasoline_rate` | number | no | 0 | Tarifa gasolina. |
| `gasoline_unit` | string | no | `"km"` | Unidad gasolina (`"km"`, `"litro"`, `"dia"`). |
| `gasoline_km` | number | no | 0 | Cantidad de unidades gasolina. |
| `unit_rent_amount` | number | no | 0 | Monto renta de unidad. |
| `unit_rent_period` | enum | no | `"dia"` | `"dia"` \| `"semana"` \| `"mes"`. **Legacy**, en desuso por el wizard nuevo. |
| `unit_rent_unit` | string | no | `"dia"` | Unidad renta de unidad (string libre). Usado por el wizard nuevo junto con `unit_rent_qty`. |
| `unit_rent_qty` | number | no | 0 | Cantidad de unidades de renta. |
| `profit_amount` | number | no | 0 | Utilidad. |
| `indirect_amount` | number | no | 0 | Indirectos. |

**Si `cost_breakdown` viene ausente o `{}`:** renderizar formato legacy (solo `subtotal_travel`). Sin desglose.

**Sobre los sufijos (`*_unit`, `*_notes`, `unit_rent_qty`):** son los campos nuevos del wizard v2. El servicio de PDF debe usarlos para armar las descripciones de las filas (ej. "5 horas × $839.22/hora" en vez de "5 días × $839.22/día"). Si los sufijos no vienen, asumir los defaults (`"dia"` para unidades, `0` para qty).

### 3.5 `pre_flight` (revisión de unidad)

| Campo | Tipo | Requerido | Default | Notas |
|---|---|---|---|---|
| `fuel_level` | number (0-100) | no | 50 | Copia del nivel de combustible al salir. |
| `cargo_description` | string | no | `""` | Descripción de la carga. |
| `items.extintor` | boolean | no | `true` | Extintor vigente. |
| `items.llanta_refaccion` | boolean | no | `true` | Llanta de refacción inflada. |
| `items.herramientas` | boolean | no | `true` | Herramientas básicas. |
| `items.gato` | boolean | no | `true` | Gato y cruceta. |
| `items.cinturon` | boolean | no | `true` | Cinturones de seguridad. |
| `items.documentos` | boolean | no | `true` | Tarjeta de circulación y póliza. |
| `items.tarjetas` | boolean | no | `true` | Tarjetas de combustible / peaje. |
| `observaciones` | string | no | `""` | Notas libres. |

**Si `pre_flight` viene ausente o `{}`:** omitir el bloque "Revisión de unidad" en el PDF.

### 3.6 Checklist legacy (`checklist_*`)

El frontend también envía `checklist_extintor`, `checklist_llanta_refaccion`, etc. al top-level por compatibilidad con código viejo. **El backend los ignora** (Mongoose strict mode los descarta). El servicio de PDF **no los recibe** — leer únicamente `pre_flight.items`.

---

## 4. Cálculo del subtotal (servicio externo debe hacer)

```
subtotal = casetas_amount
         + (operator_rate  × operator_days)
         + (per_diem_rate  × per_diem_days)
         + (gasoline_rate  × gasoline_km)
         + unit_rent_amount
         + profit_amount
         + indirect_amount
```

IVA: `subtotal × 0.16`.
TOTAL: `subtotal + IVA`.

Redondear a 2 decimales (`Math.round(x * 100) / 100`) para evitar drift por punto flotante.

---

## 5. Cómo se debe ver el PDF

### 5.1 Modo legacy (`cost_breakdown` ausente o todos los campos en 0)

Mantener el bloque actual del PDF:

```
Plan del Vehiculo
┌─────────────────────────────┬───────────────┬──────────────────────┐
│ Nombre del plan             │ Costo unit.   │ Subtotal recorrido   │
├─────────────────────────────┼───────────────┼──────────────────────┤
│ Incluye operador, combust.  │ $ 5800        │ $17,800.00           │
└─────────────────────────────┴───────────────┴──────────────────────┘
```

### 5.2 Modo desglose (`cost_breakdown` con al menos un valor > 0)

Reemplazar (o expandir) el bloque "Plan del Vehiculo" con esta tabla:

```
Plan del Vehiculo / Desglose de Conceptos
┌─────────────────────┬──────────────────────────┬──────────────────────┐
│ Concepto            │ Cantidad / Unidad        │ Importe              │
├─────────────────────┼──────────────────────────┼──────────────────────┤
│ Casetas             │ —                        │ $1,200.00            │
│ Operador            │ 14 días × $839.22/día    │ $11,749.08           │
│ Viáticos            │ 14 días × $307.80/día    │ $4,309.20            │
│ Gasolina            │ 420 km × $5.00/km        │ $2,100.00            │
│ Renta de unidad     │ Por semana               │ $17,800.00           │
│ Utilidad            │ —                        │ $666.16              │
│ Indirectos          │ —                        │ $999.24              │
├─────────────────────┼──────────────────────────┼──────────────────────┤
│                     │ Subtotal                 │ $38,823.68           │
│                     │ IVA (16%)                │ $6,211.79            │
│                     │ TOTAL                    │ $45,035.47           │
└─────────────────────┴──────────────────────────┴──────────────────────┘
```

### 5.3 Modo revisión de unidad (`pre_flight` con al menos un campo definido)

Agregar este bloque al final del PDF, después del desglose o del plan legacy:

```
REVISIÓN DE UNIDAD (Pre-Flight)
─────────────────────────────────────────────────────────
[✓] Extintor               [✓] Llanta de refacción
[✓] Herramientas           [✓] Gato y cruceta
[✓] Cinturón               [✓] Documentos
[✓] Tarjetas
─────────────────────────────────────────────────────────
Nivel de combustible: 75%
Carga: 28 ton perfiles de acero
Obs.: Sin golpes visibles. Tarjeta TC-8847 con saldo.
```

---

## 6. Reglas de render

| Caso | Comportamiento |
|---|---|
| `cost_breakdown` ausente o `{}` | Render legacy (sección 5.1). |
| `cost_breakdown` con **todos los campos en 0** | Igual al caso anterior — desglose vacío, fallback. |
| `cost_breakdown` con **al menos un valor > 0** | Render tabla de desglose (sección 5.2). |
| Fila con valor 0 | **Ocultar fila** (no mostrar "Casetas $0.00"). |
| Operador / viáticos / gasolina | Solo mostrar fila si `rate > 0 && (days > 0 \|\| km > 0)`. |
| `unit_rent_period` | Sufijo: "Por día" / "Por semana" / "Por mes". Si es `null`/ausente, omitir columna unidad. |
| Subtotal | **Recalcular** server-side como suma de filas mostradas. **No** confiar en `subtotal_travel` del payload. |
| `subtotal_travel` del payload | Mantener visible solo en modo legacy. En modo desglose, el subtotal se reemplaza por la suma recalculada. |
| IVA y TOTAL | Mostrar siempre que haya desglose, calculados sobre el subtotal recalculado. |
| `pre_flight` ausente o `{}` | Omitir el bloque "Revisión de unidad". |
| `pre_flight.items.X` en `true` | Mostrar como `[✓]`. |
| `pre_flight.items.X` en `false` | Mostrar como `[✗]` y resaltar visualmente (color rojo sugerido). |
| `pre_flight.fuel_level` | Mostrar como "Nivel de combustible: NN%" si está definido y entre 0-100. |
| `pre_flight.cargo_description` o top-level `cargo_description` | Si alguno no está vacío, mostrar como "Carga: <texto>". Si ambos están, preferir top-level. |
| `pre_flight.observaciones` no vacío | Mostrar como "Obs.: <texto>". |

---

## 7. Helper: filas que se deben mostrar (pseudo-código)

```js
// === Desglose de conceptos ===
const cb = payload.cost_breakdown || {}
const hasBreakdown = Object.entries(cb).some(([k, v]) =>
  k !== 'unit_rent_period' && typeof v === 'number' && v > 0
)

if (!hasBreakdown) {
  // render legacy con payload.subtotal_travel
} else {
  const rows = []

  if (cb.casetas_amount > 0) {
    rows.push(['Casetas', '—', fmt(cb.casetas_amount)])
  }
  if (cb.operator_rate > 0 && cb.operator_days > 0) {
    rows.push(['Operador',
      `${cb.operator_days} días × ${fmt(cb.operator_rate)}/día`,
      fmt(cb.operator_rate * cb.operator_days)])
  }
  if (cb.per_diem_rate > 0 && cb.per_diem_days > 0) {
    rows.push(['Viáticos',
      `${cb.per_diem_days} días × ${fmt(cb.per_diem_rate)}/día`,
      fmt(cb.per_diem_rate * cb.per_diem_days)])
  }
  if (cb.gasoline_rate > 0 && cb.gasoline_km > 0) {
    rows.push(['Gasolina',
      `${cb.gasoline_km} km × ${fmt(cb.gasoline_rate)}/km`,
      fmt(cb.gasoline_rate * cb.gasoline_km)])
  }
  if (cb.unit_rent_amount > 0) {
    const periodLabel = {
      dia: 'Por día',
      semana: 'Por semana',
      mes: 'Por mes'
    }[cb.unit_rent_period] || '—'
    rows.push(['Renta de unidad', periodLabel, fmt(cb.unit_rent_amount)])
  }
  if (cb.profit_amount > 0) {
    rows.push(['Utilidad', '—', fmt(cb.profit_amount)])
  }
  if (cb.indirect_amount > 0) {
    rows.push(['Indirectos', '—', fmt(cb.indirect_amount)])
  }

  const subtotal = rows.reduce((acc, r) => acc + parseFloat(r[2].replace(/[$,]/g, '')), 0)
  const iva = Math.round(subtotal * 0.16 * 100) / 100
  const total = Math.round((subtotal + iva) * 100) / 100

  // render tabla con rows + subtotal/IVA/TOTAL
}

// === Revisión de unidad ===
const pf = payload.pre_flight || {}
const hasPreFlight = Object.keys(pf).length > 0

if (hasPreFlight) {
  const checks = [
    ['Extintor',           pf.items?.extintor],
    ['Llanta de refacción', pf.items?.llanta_refaccion],
    ['Herramientas',       pf.items?.herramientas],
    ['Gato y cruceta',     pf.items?.gato],
    ['Cinturón',           pf.items?.cinturon],
    ['Documentos',         pf.items?.documentos],
    ['Tarjetas',           pf.items?.tarjetas]
  ]

  // render checks como [✓]/[✗]

  if (pf.fuel_level != null) {
    // render "Nivel de combustible: NN%"
  }
  const cargo = payload.cargo_description || pf.cargo_description
  if (cargo) {
    // render "Carga: <texto>"
  }
  if (pf.observaciones) {
    // render "Obs.: <texto>"
  }
}
```

---

## 8. Ejemplo end-to-end

**Request del frontend** (`POST /api/v1/flotilla/insert?type=renta`):

```json
{
  "vehicle": "713ZHY",
  "bussiness_cost": "626e223ffe9887654db63c37",
  "subtotal_travel": 38823.68,
  "profit_pct": 8,
  "indirect_pct": 12,
  "cost_breakdown": {
    "casetas_amount": 1200.00,
    "operator_rate": 839.22,
    "operator_days": 14,
    "per_diem_rate": 307.80,
    "per_diem_days": 14,
    "gasoline_rate": 5.00,
    "gasoline_km": 420,
    "unit_rent_amount": 17800.00,
    "unit_rent_period": "semana",
    "profit_amount": 666.16,
    "indirect_amount": 999.24
  },
  "pre_flight": {
    "fuel_level": 75,
    "cargo_description": "28 ton perfiles de acero",
    "items": {
      "extintor": true, "llanta_refaccion": true, "herramientas": true,
      "gato": true, "cinturon": true, "documentos": true, "tarjetas": true
    },
    "observaciones": "Sin golpes visibles."
  }
}
```

**Cálculo esperado del desglose:**

| Concepto | Cálculo | Importe |
|---|---|---|
| Casetas | 1200 | $1,200.00 |
| Operador | 839.22 × 14 | $11,749.08 |
| Viáticos | 307.80 × 14 | $4,309.20 |
| Gasolina | 5 × 420 | $2,100.00 |
| Renta de unidad | 17800 | $17,800.00 |
| Utilidad | 666.16 | $666.16 |
| Indirectos | 999.24 | $999.24 |
| **Subtotal** | | **$38,823.68** |
| IVA (16%) | 38823.68 × 0.16 | $6,211.79 |
| **TOTAL** | | **$45,035.47** |

`subtotal_travel` enviado por el frontend (38823.68) **debe coincidir** con la suma recalculada. Si difiere, el servicio externo debe usar el recalculado y loguear la discrepancia.

---

## 9. Cambios por versión

| Versión | Fecha | Cambios |
|---|---|---|
| Round 1 | 2026-05-31 | Payload inicial + `cost_breakdown`. |
| Round 2 | 2026-06-01 | + `pre_flight` subdoc, + `profit_pct` / `indirect_pct` / `cargo_description` top-level, `subtotal_travel` ahora `Number` en schema (en payload sigue como string formateado). |
| Round 3 | 2026-06-01 | + `origin` / `destination` / `stops` / `cost_center` / `notes` top-level, + sufijos del desglose (`casetas_unit`, `casetas_notes`, `operator_unit`, `per_diem_unit`, `gasoline_unit`, `unit_rent_unit`, `unit_rent_qty`). `unit_rent_period` queda como legacy. |

---

## 10. Riesgos y notas

- **El servicio externo de PDF vive en otro repo.** Este doc es el contrato que ese equipo debe consumir.
- **Drift de punto flotante:** si el servicio externo y el frontend calculan con precisiones distintas, pueden divergir por centavos. Aplicar `Math.round(x * 100) / 100` antes de formatear.
- **`subtotal_travel` legacy:** algunos documentos viejos no tienen `cost_breakdown` ni recalculo posible. El payload siempre trae `subtotal_travel` formateado (`"$17,800.00"`); usar ese string directo en modo legacy sin parsear.
- **`subtotal_travel` en Mongo es `Number` desde Round 2**, pero el payload que recibe el servicio de PDF es **string formateado** (lo formatea `vehicleData` con `Intl.NumberFormat`). Si necesitan operar aritméticamente sobre el subtotal, parsearlo del string.
- **`profit_pct` / `indirect_pct` no se usan automáticamente** en el render del PDF actual. Quedan en el payload para que el servicio externo los muestre como info contextual si lo desea (ej. "Utilidad aplicada: 8%").
- **No agregar nuevos campos al payload sin actualizar este doc.** El equipo del servicio externo de PDF referencia este archivo como spec.
