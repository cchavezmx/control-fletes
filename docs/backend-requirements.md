# Backend Requirements – Desglose de Conceptos (Renta/Flete) y Payload del Wizard

> **Status:** Wizard re-arquitecturado, gaps identificados entre frontend y backend
> **Wizard source:** `Components/DocumentWizard/index.jsx` + `Components/Modal/RentaConceptsBreakdown.jsx`
> **Hook:** `hooks/useDocumentWizard.js`
> **Related:** Excel interno "Renta UNIDADES ROGER"

---

## 1. Resumen del estado actual

El wizard (`POST /flotilla/insert?type=renta|flete|traslado`) **sí** envía los 5 conceptos del desglose, **pero solo como strings sueltos al top-level del payload**. El backend recibe:

- ✅ `subtotal_travel` (Number) — único campo que el frontend garantiza como número
- ❌ Los 20+ campos de conceptos (rates, qty, units, notes) llegan como **strings vacíos** si el usuario no tocó la card, o como **strings** con dígitos si las tocó
- ❌ No existe el objeto anidado `cost_breakdown` que el doc anterior recomendaba
- ❌ No existe `profit_amount` / `indirect_amount` (solo los porcentajes)
- ⚠️ El bloque de Revisión de Unidad (`pre_flight`) sí se envía anidado, pero los `checklist_*` también van duplicados al top-level

**Consecuencia:** el backend puede leer `subtotal_travel` y `pre_flight`, pero el desglose por concepto (lo que el cliente quiere ver en el PDF) llega incompleto o inutilizable sin coerción de tipos en el servidor.

---

## 2. Recap detallado del payload por paso del wizard

### Paso 1 — Tipo y Vehículo
| Campo UI | Va al payload como | Tipo actual | Notas |
|---|---|---|---|
| Cards de tipo | `type` (URL param) | string enum | `traslado`\|`flete`\|`renta` |
| `VehiclesSelector` | `vehicle` | **string (placa)** | NO es el `_id` del vehículo |
| `select` de plan | `plan` | string ObjectId | opcional |
| Plan seleccionado | `description` | **objeto plan completo** | `{_id, planName, planPrice, planDescription, ...}` |
| Folio consecutivo | — | — | **El backend lo asigna**, el frontend solo lo muestra |
| `empresaId` prop | `bussiness_cost` | string ObjectId | inyectado por el hook |

### Paso 2 — Cliente y Fechas
| Campo UI | Va al payload | Tipo schema | Notas |
|---|---|---|---|
| `select` cliente | `client` | string (min 1) | ObjectId de la empresa destino |
| `input` asunto | `subject` | string (min 1) | normalizado a Title Case |
| `select` centro de costos | `cost_center` | string enum | `logistica`\|`operaciones`\|`comercial`\|`administracion`\|"" |
| `DatePickerIntecsa` × 2 | `request_date`, `delivery_date` | string YYYY-MM-DD | default = hoy |

### Paso 3 — Detalles Operativos
| Campo UI | Va al payload | Tipo schema | Notas |
|---|---|---|---|
| `input` conductor | `driver` | string (min 1) | normalizado a UPPER |
| `input` origen | `origin` | string (min 1) | trim |
| `input` destino | `destination` | string (min 1) | trim |
| `StopsField` (dinámico) | `stops` | string[] | array de strings limpios (trim) |
| Derivado backend-side | `route` | string | `"origin → stop1 → stop2 → destination"` |
| `input` recorrido | `recorrido_km` | **string** ⚠️ | backend espera Number |
| `input` km salida | `kilometer_out` | **string** ⚠️ | backend espera Number |
| `input` link maps | `link_googlemaps` | string opcional | trim |

### Paso 4 — Revisión de Unidad (Pre-Flight)
| Campo UI | Va al payload | Tipo | Notas |
|---|---|---|---|
| `FuelLevelSlider` (0-100) | `fuel_level` | Number | default 50 |
| `input` carga | `cargo_description` | string | trim |
| 7× checkboxes | `checklist_extintor`, `checklist_llanta_refaccion`, `checklist_herramientas`, `checklist_gato`, `checklist_cinturon`, `checklist_documentos`, `checklist_tarjetas` | boolean | default `true` |
| `textarea` observaciones | `checklist_observaciones` | string | default "" |
| **Mapeo anidado del hook** (líneas 298-311) | `pre_flight` | objeto | `{fuel_level, cargo_description, items:{7 booleans}, observaciones}` |
| ⚠️ Duplicación | `checklist_*` al top-level | boolean | se filtra vía `...normalized` |

**Gaps del paso 4:**
- `fuel_card` (tarjeta combustible) está en el schema (`z.string().optional()`) **pero no tiene input en el wizard** — el form de edición legacy (`pages/update/[objectId].js`) sí lo muestra
- `fuel_amount` (carga combustible) mismo caso: en schema, sin input
- `project_id` mismo caso

### Paso 5 — Facturación (Desglose de Conceptos + Tarjeta)
| Campo UI | Va al payload | Tipo schema | Notas |
|---|---|---|---|
| `input` folio fiscal | `document_id` | string | UUID del CFDI |
| `RentaConceptsBreakdown` × 5 cards | ver tabla 5.1 | **string** ⚠️ | todos los *_amount/_rate/_days/_qty son strings |
| `input` pct utilidad | `profit_pct` | Number 0-100 | default 8 |
| `input` pct indirectos | `indirect_pct` | Number 0-100 | default 12 |
| `input` tarjeta/forma de pago | `tarjeta_deposito` | string | trim |

#### 5.1 — Campos de cada concepto (RentaConceptsBreakdown)

| Concepto | rate field | unit field | qty field | notes field | Tipo actual |
|---|---|---|---|---|---|
| Casetas | `casetas_amount` | `casetas_unit` (locked `fijo`) | `casetas_days` | `casetas_notes` | string × 4 |
| Operador | `operator_rate` | `operator_unit` (locked `dia`) | `operator_days` | `operator_notes` | string × 4 |
| Viáticos | `per_diem_rate` | `per_diem_unit` (locked `dia`) | `per_diem_days` | `per_diem_notes` | string × 4 |
| Gasolina | `gasoline_rate` | `gasoline_unit` (locked `dia`) | — (qty = `diasPeriodo`) | `gasoline_notes` | string × 3 |
| Renta de unidad | `unit_rent_amount` | `unit_rent_unit` (locked `dia`) | `unit_rent_qty` | `unit_rent_notes` | string × 4 |

**Bug crítico:** `RentaConceptsBreakdown.jsx:384-391` sobrescribe `subtotal_travel` en CADA render con el cálculo interno. Si el usuario abre y cierra cards sin tocar nada, `subtotal_travel` queda en `0` aunque la BD traiga un valor previo (no es problema para INSERT, sí para UPDATE que no se implementó). Más importante: **el cálculo de subtotal es la ÚNICA señal numérica que el backend recibe del desglose**.

**Cálculo del subtotal (frontend, líneas 377-382 de RentaConceptsBreakdown.jsx):**
```
subtotal = casetasAmount  (si unit==='fijo', sino casetasAmount * casetasDays)
        + operatorRate  * operatorDays
        + perDiemRate   * perDiemDays
        + gasolineRate  * diasPeriodo
        + unitRentAmount * unitRentQty
utilidad    = subtotal * (profitPct / 100)
indirectos  = subtotal * (indirectPct / 100)
base        = subtotal + utilidad + indirectos
iva         = base * 0.16
total       = base + iva
```

`diasPeriodo` = `Math.round((delivery_date - request_date) / 86400000)` (mín 1).

### Paso 6 — Resumen
No genera campos nuevos. Solo recalcula en pantalla los mismos conceptos con `computeConcept()` (líneas 549-579) — **duplicación del cálculo** entre `RentaConceptsBreakdown` y `StepResumen`. Si el backend recibe los rates, puede confiar en `subtotal_travel` y reproducirlo.

---

## 3. Payload JSON real enviado por el frontend

Cuando el usuario completa TODOS los pasos del wizard (`POST /flotilla/insert?type=renta`):

```json
{
  "plan": "6643f2a8e1b2c3d4e5f60718",
  "client": "626e223ffe9887654db63c38",
  "subject": "Renta De Unidad Para Obra Neiboruga",
  "request_date": "2025-07-01",
  "delivery_date": "2025-07-15",
  "driver": "JUAN PÉREZ GARCÍA",
  "origin": "Cd. Obregón, Son.",
  "destination": "Hermosillo, Son.",
  "stops": ["Empalme, Son.", "Guaymas, Son."],
  "route": "Cd. Obregón, Son. → Empalme, Son. → Guaymas, Son. → Hermosillo, Son.",
  "recorrido_km": "420",
  "kilometer_out": "87500",
  "subtotal_travel": 0,
  "fuel_level": 75,
  "document_id": "SAL-2025-001",
  "fuel_card": "",
  "fuel_amount": "",
  "link_googlemaps": "https://maps.app.goo.gl/abc123",
  "casetas": "",
  "tarjeta_deposito": "BANCOMER 4152 **** **** 7733",
  "casetas_amount": "1200",
  "casetas_unit": "fijo",
  "casetas_days": "",
  "casetas_notes": "Casetas del tramo completo",
  "operator_rate": "839.22",
  "operator_unit": "dia",
  "operator_days": "14",
  "operator_notes": "Operador certificado",
  "per_diem_rate": "307.80",
  "per_diem_unit": "dia",
  "per_diem_days": "14",
  "per_diem_notes": "",
  "gasoline_rate": "5.00",
  "gasoline_unit": "dia",
  "gasoline_notes": "Diesel, cargado en trayecto",
  "unit_rent_amount": "17800.00",
  "unit_rent_unit": "dia",
  "unit_rent_qty": "1",
  "unit_rent_notes": "Semana completa",
  "unit_rent_period": "",
  "profit_pct": 8,
  "indirect_pct": 12,
  "cost_center": "logistica",
  "cargo_description": "28 ton perfiles de acero",
  "checklist_extintor": true,
  "checklist_llanta_refaccion": true,
  "checklist_herramientas": true,
  "checklist_gato": true,
  "checklist_cinturon": true,
  "checklist_documentos": true,
  "checklist_tarjetas": true,
  "checklist_observaciones": "Sin golpes visibles. Tarjeta TC-8847 con saldo.",

  "route": "Cd. Obregón, Son. → Empalme, Son. → Guaymas, Son. → Hermosillo, Son.",
  "description": {
    "_id": "6643f2a8e1b2c3d4e5f60718",
    "planName": "Renta Nacional Larga Distancia",
    "planPrice": 17800,
    "planDescription": "Incluye operador, combustible base y viáticos"
  },
  "vehicle": "713ZHY",
  "bussiness_cost": "626e223ffe9887654db63c37",

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
  }
}
```

### 3.1 — Campos vacíos que el backend recibe si el usuario no los tocó
Si el operador pasa por el wizard sin capturar conceptos (raro, pero válido para `traslado`):
- Todos los `casetas_*`, `operator_*`, `per_diem_*`, `gasoline_*`, `unit_rent_*` llegan como `""` (string vacío)
- `subtotal_travel` queda en `0` (Number)
- El backend que valide `z.number().min(0)` rompe; el que confíe en coerción recibe `""`

### 3.2 — Tipos incorrectos
| Campo | Frontend envía | Backend esperaría |
|---|---|---|
| `casetas_amount`, `operator_rate`, `per_diem_rate`, `gasoline_rate`, `unit_rent_amount` | string `"839.22"` | Number `839.22` |
| `casetas_days`, `operator_days`, `per_diem_days`, `unit_rent_qty` | string `"14"` | Number `14` |
| `recorrido_km`, `kilometer_out`, `fuel_amount` | string | Number |
| `unit_rent_period` | siempre `""` (no se asigna) | `"dia"`\|`"semana"`\|`"mes"` |
| `profit_pct`, `indirect_pct` | Number ✅ | Number |
| `fuel_level` | Number ✅ | Number 0-100 |

---

## 4. Decisiones pendientes para el backend

### 4.1 — Sobre la persistencia del desglose

**Opción A (recomendada):** Backend acepta los campos **planos** y los persiste en un subdocumento `cost_breakdown` server-side:
```js
cost_breakdown: {
  casetas_amount: Number(casetas_amount || 0),
  casetas_unit:   casetas_unit   || 'fijo',
  casetas_days:   Number(casetas_days || 0),
  casetas_notes:  casetas_notes  || '',
  operator_rate:  Number(operator_rate || 0),
  operator_unit:  operator_unit  || 'dia',
  operator_days:  Number(operator_days || 0),
  operator_notes: operator_notes || '',
  per_diem_rate:  Number(per_diem_rate || 0),
  per_diem_unit:  per_diem_unit  || 'dia',
  per_diem_days:  Number(per_diem_days || 0),
  per_diem_notes: per_diem_notes || '',
  gasoline_rate:  Number(gasoline_rate || 0),
  gasoline_unit:  gasoline_unit  || 'dia',
  gasoline_notes: gasoline_notes || '',
  unit_rent_amount: Number(unit_rent_amount || 0),
  unit_rent_unit:   unit_rent_unit   || 'dia',
  unit_rent_qty:    Number(unit_rent_qty || 1),
  unit_rent_notes:  unit_rent_notes  || '',
  unit_rent_period: unit_rent_period || ''
}
```

**Opción B:** Frontend transforma a `cost_breakdown` anidado antes del POST. Implica tocar `useDocumentWizard.js` y `DOCUMENT_SCHEMA`.

**Opción C:** No persistir desglose. Solo guardar `subtotal_travel`. **ESTO ES LO QUE PASA HOY.** Es el "mal" que reportas.

### 4.2 — Sobre `pre_flight` y los `checklist_*` top-level
- **Recomendación:** persistir solo `pre_flight` anidado; ignorar los `checklist_*` planos (legacy) o marcarlos deprecated.
- Mantener `checklist_*` solo si otros módulos los leen desde top-level (verificar con `grep "checklist_" /pages /Components`).

### 4.3 — Sobre `profit_amount` / `indirect_amount`
El doc original pide montos explícitos. El frontend solo manda `%`. **Opciones:**
- Persistir `profit_pct` + recalcular server-side (consistente con el cálculo que el frontend muestra)
- Persistir `profit_amount = subtotal * (profit_pct/100)` como campo derivado y mostrarlo en PDF

**Recomendación:** persistir ambos (pct y monto) para reportes sin recalcular.

### 4.4 — Sobre `unit_rent_period`
El UI actual no lo expone. **Opciones:**
- Quitarlo del schema del frontend
- Agregar un `select` en la card "Renta de unidad" del breakdown
- Mappear `unit_rent_unit` → `unit_rent_period` server-side cuando unit sea `dia` (default)

### 4.5 — Sobre `fuel_card`, `fuel_amount`, `project_id`
Están en el schema sin input en el wizard nuevo. **Opciones:**
- Agregar inputs en el Paso 5 (Facturación) — el legacy update ya los tiene
- Quitar del schema
- Persistir siempre como `""` si el frontend nunca los manda

---

## 5. Endpoints a modificar

### `POST /flotilla/insert?type=...`
- Aceptar y persistir el subdocumento `cost_breakdown` (recomendado: transformar server-side desde los campos planos)
- Aceptar y persistir `pre_flight` anidado
- Persistir `profit_pct`, `indirect_pct`, `subtotal_travel` como Numbers validados
- Coercer a Number todos los *_amount/_rate/_days/_qty antes de persistir (o guardar tal cual si son strings y transformar al renderizar)

### `GET /flotilla/documentos/:empresaId`
Devolver en cada documento de `rentas[]` y `fletes[]`:
```json
{
  "_id": "...",
  "subtotal_travel": 17800.00,
  "profit_pct": 8,
  "indirect_pct": 12,
  "cost_breakdown": {
    "casetas_amount": 1200.00,
    "casetas_unit": "fijo",
    "operator_rate": 839.22,
    "operator_unit": "dia",
    "operator_days": 14,
    "unit_rent_amount": 17800.00,
    "unit_rent_period": "semana"
  },
  "pre_flight": {
    "fuel_level": 75,
    "cargo_description": "...",
    "items": { "extintor": true, "...": "..." },
    "observaciones": "..."
  }
}
```

### `PUT /flotilla/documentos/update/:id?type=...`
- Aceptar `cost_breakdown` y `pre_flight` para update
- Validar que `subtotal_travel` enviado coincida con recálculo (opcional)

### `GET /flotilla/plan/print/:id?type=...` (PDF)
Renderizar 3 bloques:

**Bloque 1 — Desglose de Conceptos** (si `cost_breakdown` existe):
```
CONCEPTO                  CANTIDAD / UNIDAD        IMPORTE
─────────────────────────────────────────────────────────
Casetas                                          $1,200.00
Operador                  14 días × $839.22/día   $11,749.08
Viáticos                  14 días × $307.80/día   $4,309.20
Gasolina                  14 días × $5.00/día     $70.00
Renta de unidad           1 × $17,800.00          $17,800.00
─────────────────────────────────────────────────────────
Subtotal                                       $35,128.28
Utilidad 8%                                     $2,810.26
Indirectos 12%                                  $4,215.39
IVA 16%                                         $6,747.23
─────────────────────────────────────────────────────────
TOTAL                                          $48,901.16
```

**Bloque 2 — Revisión de Unidad** (si `pre_flight` existe):
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

**Bloque 3 — Legacy** (si NO existe `cost_breakdown`, mantener formato anterior con solo `subtotal_travel`).

---

## 6. Esquema MongoDB sugerido

```js
const CostBreakdownSchema = new Schema({
  casetas_amount:  { type: Number, default: 0 },
  casetas_unit:    { type: String, enum: ['fijo','dia','semana','mes'], default: 'fijo' },
  casetas_days:    { type: Number, default: 0 },
  casetas_notes:   { type: String, default: '' },
  operator_rate:   { type: Number, default: 0 },
  operator_unit:   { type: String, enum: ['fijo','dia','semana','mes'], default: 'dia' },
  operator_days:   { type: Number, default: 0 },
  operator_notes:  { type: String, default: '' },
  per_diem_rate:   { type: Number, default: 0 },
  per_diem_unit:   { type: String, enum: ['fijo','dia','semana','mes'], default: 'dia' },
  per_diem_days:   { type: Number, default: 0 },
  per_diem_notes:  { type: String, default: '' },
  gasoline_rate:   { type: Number, default: 0 },
  gasoline_unit:   { type: String, enum: ['fijo','dia','semana','mes'], default: 'dia' },
  gasoline_notes:  { type: String, default: '' },
  unit_rent_amount:{ type: Number, default: 0 },
  unit_rent_unit:  { type: String, enum: ['fijo','dia','semana','mes'], default: 'dia' },
  unit_rent_qty:   { type: Number, default: 1 },
  unit_rent_notes: { type: String, default: '' },
  unit_rent_period:{ type: String, enum: ['dia','semana','mes'], default: 'dia' }
}, { _id: false })

const PreFlightSchema = new Schema({
  fuel_level:      { type: Number, min: 0, max: 100, default: 50 },
  cargo_description: { type: String, default: '' },
  items: {
    extintor:         { type: Boolean, default: true },
    llanta_refaccion: { type: Boolean, default: true },
    herramientas:     { type: Boolean, default: true },
    gato:             { type: Boolean, default: true },
    cinturon:         { type: Boolean, default: true },
    documentos:       { type: Boolean, default: true },
    tarjetas:         { type: Boolean, default: true }
  },
  observaciones: { type: String, default: '' }
}, { _id: false })

// En schema principal de renta/flete:
{
  // ... campos legacy ...
  subtotal_travel: { type: Number, default: 0 },
  profit_pct:      { type: Number, default: 8 },
  indirect_pct:    { type: Number, default: 12 },
  cost_breakdown:  { type: CostBreakdownSchema, default: () => ({}) },
  pre_flight:      { type: PreFlightSchema, default: () => ({}) }
}
```

### Para Traslado
El checklist aplica igual; se persiste `pre_flight` en las 3 colecciones. `cost_breakdown` puede omitirse o quedar vacío (el paso 5 no se muestra relevante para traslado, pero el schema lo permite).

---

## 7. Plan de trabajo sugerido

| # | Tarea | Owner | Estimación | Prioridad |
|---|---|---|---|---|
| 1 | Coercer campos de conceptos a Number en `POST /flotilla/insert` | Backend | 30m | **ALTA** — sin esto el desglose es inútil |
| 2 | Persistir `cost_breakdown` anidado en `POST /insert` | Backend | 1h | **ALTA** |
| 3 | Persistir `pre_flight` anidado en `POST /insert` | Backend | 30m | **ALTA** |
| 4 | Devolver `cost_breakdown` y `pre_flight` en `GET /documentos/:id` | Backend | 30m | **ALTA** |
| 5 | Aceptar `cost_breakdown` y `pre_flight` en `PUT /update` | Backend | 1h | MEDIA |
| 6 | Modificar template de PDF para renderizar desglose y checklist | PDF service | 3-4h | MEDIA |
| 7 | Persistir `profit_amount` e `indirect_amount` derivados | Backend | 30m | BAJA |
| 8 | Validar `unit_rent_period` (default `dia` si vacío) | Backend | 15m | BAJA |
| 9 | Decidir qué hacer con `fuel_card`/`fuel_amount`/`project_id` (no usados en wizard) | Frontend + Backend | 30m | BAJA |
| 10 | Limpiar `checklist_*` top-level del payload (mantener solo `pre_flight`) | Frontend | 30m | MEDIA |
| 11 | Quitar `casetas_num` y `unit_rent_period` del schema si no se usan | Frontend | 15m | BAJA |
| 12 | QA: crear documento de renta con todos los campos, verificar en PDF | QA | 1h | **ALTA** |

---

## 8. Notas para el frontend (post-backend)

1. **Quitar duplicación `checklist_*` top-level**: el wizard debe enviar **solo** `pre_flight` anidado. Limpiar `useDocumentWizard.js` para no esparcir los `checklist_*` en el payload.
2. **Decidir si frontend sigue enviando campos planos o anidados**: si backend confirma que los transforma server-side, no tocar el wizard. Si backend quiere el `cost_breakdown` directo, modificar `onSubmit` para construir el objeto anidado antes del POST.
3. **Resolver campos sin input en el wizard**: `fuel_card`, `fuel_amount`, `project_id` están en el schema pero no se capturan. O se exponen en el Paso 5, o se quitan del schema. El form de edición legacy (`pages/update/[objectId].js`) sí los lee.
4. **Tabla de documentos (`TableFlotillas` / `DocDetailDrawer`)**: ya lee `doc.casetas_amount` etc. desde top-level (ver `Components/Expediente/DocDetailDrawer.jsx:90-220`). Si backend los mueve a `cost_breakdown`, actualizar el drawer.
5. **Vista previa del PDF (`PrevPDFModal`)**: no requiere cambios si el PDF ya trae el desglose renderizado.
6. **Edición de documento (`update/[id]`)**: precargar `cost_breakdown.casetas_amount` etc. cuando backend los devuelva anidados.

---

## 9. Riesgos

- **Tipos string vs Number**: el backend actual puede estar guardando strings como Number en MongoDB sin coerción → al sumar con `$sum` en agregaciones, obtendrá 0 o error. **Crítico resolver antes de cualquier reporte.**
- **Cálculo de subtotal**: si backend y frontend calculan con precisión de punto flotante distinta, pueden divergir por centavos. Acordar redondeo a 2 decimales (`toFixed(2)`).
- **PDF service separado**: el template de PDF está en `PDF_SERVICE_URL`, no en este repo. Coordinar cambios con quien lo mantenga.
- **Defaults invertidos en checklist**: el frontend asume `true` (todo OK) y el operador destilda. Si el backend asume `false` (todo mal), los legacy quedan con valores invertidos. **Recomendación documentada**: mismo default que frontend (`true`).
- **Validación de `fuel_level`**: rango 0-100. Si el PDF lo recibe fuera de rango, el template puede romperse.
- **Compatibilidad con Traslado**: el checklist aplica también para Traslado, no solo Renta/Flete. Persistir `pre_flight` en las 3 colecciones.

---

## 10. Diferencias vs versión anterior del doc

| Tema | Doc anterior | Estado real |
|---|---|---|
| `cost_breakdown` anidado | "recomendado" | **No se envía** — todo plano |
| `unit_rent_period` | "debe persistirse" | **No se asigna en el UI** — siempre `""` |
| `profit_amount` / `indirect_amount` | "monto explícito" | **No existen en schema** — solo `%` |
| `pre_flight` | "bloque de Revisión de Unidad" | **Sí se envía anidado** ✅ |
| `fuel_card`, `fuel_amount` | "capturar" | **En schema, sin input en wizard** |
| `subtotal_travel` | "backend debe recalcular" | **El frontend lo sobrescribe en cada render** — el backend solo persiste |

El cambio más urgente es **persisitir el desglose de conceptos** (actualmente se pierde salvo el subtotal). Después limpiar la duplicación `checklist_*` / `pre_flight` y decidir qué hacer con los campos sin input (`fuel_card`, `fuel_amount`, `project_id`, `unit_rent_period`).
