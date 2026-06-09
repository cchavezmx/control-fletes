# Plan: PDF con desglose completo (5 conceptos + utilidad + indirectos)

> **Status:** Instrucciones listas para enviar a los equipos de **backend** (`api-control-inventario`) y **servicio de PDF** (externo).
> **Problema:** El PDF actual solo muestra la fila de Renta. El desglose completo (Casetas, Operador, Viáticos, Gasolina, Renta, Utilidad, Indirectos) no se renderiza.
> **Causa raíz:** El frontend no enviaba el subdocumento `cost_breakdown` y el campo `gasoline_km` no estaba registrado en el schema. Fix de frontend ya aplicado en `hooks/useDocumentWizard.js`. Pendiente: backend y servicio de PDF.

---

## 📦 Para el equipo BACKEND (`api-control-inventario`)

**Asunto:** Persistir el subdocumento `cost_breakdown` en `POST /flotilla/insert` y `PUT /flotilla/update/:id`

Hoy el frontend ya envía el desglose completo en el payload, pero como campos **planos al top-level** (ej. `casetas_amount`, `operator_rate`, `gasoline_rate`, etc. y, desde hoy, también como objeto anidado `cost_breakdown`). Necesitamos que el schema de Mongoose lo acepte y persista.

### Cambios requeridos

1. **Aceptar el subdocumento anidado `cost_breakdown` en el body** de `POST /flotilla/insert?type=renta|flete|traslado` y `PUT /flotilla/update/:id?type=...`. No rompen los documentos viejos — si el campo no viene, queda `undefined` y se cae al fallback top-level que ya existía.

2. **Coersión a `Number`** en todos los campos numéricos al persistir. Hoy llegan como strings (`"839.22"`, `"14"`) y Mongo los guarda como string, lo que rompe los `$gt: 0` y los agregados.

3. **Forwardear `cost_breakdown` y `profit_amount` / `indirect_amount` tal cual** al servicio de PDF cuando se llame a `POST ${PDF_SERVICE}/vehicle-invoice/`. Hoy `vehicleData` (en `services/PDFServices.js`) solo manda `subtotal_travel` y por eso el PDF renderiza en modo legacy.

### Forma del objeto a persistir

Basado en `docs/pdf-payload-spec.md` §3.4 y §4 (contrato activo con el servicio de PDF):

```js
// Mongoose schema add-on (subdocumento embebido)
const costBreakdownSchema = new mongoose.Schema({
  casetas_amount:   { type: Number, default: 0 },
  casetas_unit:     { type: String, default: 'fijo' },
  casestas_days:    { type: Number, default: 0 },  // ojo: typo histórico, mantenerlo si ya existe
  casetas_notes:    { type: String, default: '' },
  operator_rate:    { type: Number, default: 0 },
  operator_unit:    { type: String, default: 'dia' },
  operator_days:    { type: Number, default: 0 },
  operator_notes:   { type: String, default: '' },
  per_diem_rate:    { type: Number, default: 0 },
  per_diem_unit:    { type: String, default: 'dia' },
  per_diem_days:    { type: Number, default: 0 },
  per_diem_notes:   { type: String, default: '' },
  gasoline_rate:    { type: Number, default: 0 },
  gasoline_unit:    { type: String, default: 'dia' },
  gasoline_km:      { type: Number, default: 0 },
  gasoline_notes:   { type: String, default: '' },
  unit_rent_amount: { type: Number, default: 0 },
  unit_rent_unit:   { type: String, default: 'dia' },
  unit_rent_qty:    { type: Number, default: 1 },
  unit_rent_notes:  { type: String, default: '' },
  unit_rent_period: { type: String, default: 'dia' },
  profit_amount:    { type: Number, default: 0 },
  indirect_amount:  { type: Number, default: 0 }
}, { _id: false })

// En el modelo principal (rentas/fletes/traslados):
{
  ...
  cost_breakdown: { type: costBreakdownSchema, default: () => ({}) },
  profit_amount: { type: Number, default: 0 },   // top-level (spec §10)
  indirect_amount: { type: Number, default: 0 }, // top-level (spec §10)
  ...
}
```

### Coersión sugerida (en el controller)

```js
// POST /flotilla/insert y PUT /flotilla/update/:id
const num = (v) => Number(v || 0)
const cb = req.body.cost_breakdown || {}
const normalized = {
  casetas_amount:   num(cb.casetas_amount),
  casetas_unit:     cb.casetas_unit   || 'fijo',
  casetas_days:     num(cb.casetas_days),
  casetas_notes:    cb.casetas_notes  || '',
  operator_rate:    num(cb.operator_rate),
  operator_unit:    cb.operator_unit  || 'dia',
  operator_days:    num(cb.operator_days),
  operator_notes:   cb.operator_notes || '',
  per_diem_rate:    num(cb.per_diem_rate),
  per_diem_unit:    cb.per_diem_unit  || 'dia',
  per_diem_days:    num(cb.per_diem_days),
  per_diem_notes:   cb.per_diem_notes || '',
  gasoline_rate:    num(cb.gasoline_rate),
  gasoline_unit:    cb.gasoline_unit  || 'dia',
  gasoline_km:      num(cb.gasoline_km || req.body.recorrido_km),
  gasoline_notes:   cb.gasoline_notes || '',
  unit_rent_amount: num(cb.unit_rent_amount),
  unit_rent_unit:   cb.unit_rent_unit || 'dia',
  unit_rent_qty:    num(cb.unit_rent_qty || 1),
  unit_rent_notes:  cb.unit_rent_notes || '',
  unit_rent_period: cb.unit_rent_period || 'dia',
  profit_amount:    num(cb.profit_amount),
  indirect_amount:  num(cb.indirect_amount)
}

const subtotal = num(req.body.subtotal_travel)
const profitPct = num(req.body.profit_pct)
const indirectPct = num(req.body.indirect_pct)
const profitAmount = +(subtotal * profitPct / 100).toFixed(2)
const indirectAmount = +(subtotal * indirectPct / 100).toFixed(2)

await Model.create({
  ...req.body,
  cost_breakdown: normalized,
  profit_amount: profitAmount,     // redundante top-level (spec §10)
  indirect_amount: indirectAmount  // redundante top-level
})
```

### Riesgo / nota

`docs/backend-requirements.md` ya tiene el §4.1 Opción A recomendado (transformar server-side). El spec del PDF (`docs/pdf-payload-spec.md`) ya está cerrado y no requiere cambios — el contrato es estable.

---

## 📄 Para el equipo del SERVICIO DE PDF (externo)

**Asunto:** El PDF debe renderizar el desglose completo (5 conceptos + utilidad + indirectos), no solo la renta

### Comportamiento actual

Cuando un documento trae `cost_breakdown` con al menos un campo numérico `> 0`, el servicio entra en **modo desglose** (§5.2 del spec `docs/pdf-payload-spec.md`) y debe reemplazar el bloque "Plan del Vehiculo" legacy con una tabla de 5 filas + utilidad + indirectos + subtotal + IVA + total.

### Comportamiento esperado (mismo spec, solo confirmar implementación)

**Trigger de modo desglose** (ya en spec §6):
```
hasBreakdown = Object.entries(cost_breakdown).some(([k, v]) =>
  k !== 'unit_rent_period' && typeof v === 'number' && v > 0
)
```

**Filas a renderizar, en este orden exacto** (spec §5.2 + §7):
1. **Casetas** — solo si `casetas_amount > 0` — cantidad `—` — importe `casetas_amount`
2. **Operador** — solo si `operator_rate > 0 && operator_days > 0` — `"<days> días × $<rate>/día"` — importe `operator_rate × operator_days`
3. **Viáticos** — solo si `per_diem_rate > 0 && per_diem_days > 0` — `"<days> días × $<rate>/día"` — importe `per_diem_rate × per_diem_days`
4. **Gasolina** — solo si `gasoline_rate > 0 && gasoline_km > 0` — `"<km> km × $<rate>/km"` — importe `gasoline_rate × gasoline_km`
5. **Renta de unidad** — solo si `unit_rent_amount > 0` — `"Por día"` / `"Por semana"` / `"Por mes"` según `unit_rent_period`, o `—` si viene vacío — importe `unit_rent_amount`
6. **Utilidad** — solo si `profit_amount > 0` — `—` — importe `profit_amount`
7. **Indirectos** — solo si `indirect_amount > 0` — `—` — importe `indirect_amount`

**Cálculo del subtotal** (spec §4 — **recalcular server-side, NO confiar en `subtotal_travel` del payload**):
```
subtotal = casetas_amount
         + (operator_rate  × operator_days)
         + (per_diem_rate  × per_diem_days)
         + (gasoline_rate  × gasoline_km)
         + unit_rent_amount
         + profit_amount
         + indirect_amount
iva   = round2(subtotal × 0.16)
total = round2(subtotal + iva)
```

**Si difiere del `subtotal_travel` que manda el frontend**: usar el recalculado y loguear la discrepancia (spec §430). El frontend va a empezar a mandar `subtotal_travel` igual a la suma, pero defensivo.

**Redondeo**: `Math.round(x * 100) / 100` antes de formatear a `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` (spec §210).

**Ocultar fila si valor es 0** (spec §6, §278-279). El helper de pseudo-código ya está en spec §7.

### Caso reportado (bug)

Un documento Renta con `unit_rent_amount = 17800` se está renderizando mostrando **solo la fila de Renta y la sección de totales**, omitiendo Casetas, Operador, Viáticos y Gasolina. Causa más probable: el backend (`api-control-inventario`) no está haciendo forward de `cost_breakdown` al servicio de PDF, o el servicio está cayendo a modo legacy porque recibe el subdoc vacío/`{}`.

### Acción concreta

1. Verificar en logs del servicio que el payload entrante trae el objeto `cost_breakdown` con los 5 rates y qty.
2. Si no llega, el problema está en el backend (ver bloque de arriba).
3. Si llega pero la tabla no se renderiza, validar la condición `hasBreakdown` y el loop de filas según spec §7.

Spec de referencia: `docs/pdf-payload-spec.md` (este repo, contrato activo desde Round 1, última revisión Round 3 = 2026-06-01).
