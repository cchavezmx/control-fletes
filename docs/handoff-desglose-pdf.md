# Handoff: bug del total en PDF — coordinación wizard → API → servicio de PDF

> **Fecha:** 2026-09-28 · **Estado:** frontend listo; API backend en PR (`feat/cost-breakdown-importes`, repo `api-control-inventario`); servicio de PDF pendiente.
> **Contrato técnico completo:** ver `docs/pdf-payload-spec.md` (§3.4, §4 y §7 ya actualizados).
> **Plan detallado para el servicio de PDF:** ver `docs/plan-servicio-pdf-desglose.md`.

## 1. El problema

Documento real: **renta de 40 día × $430.00**, utilidad 8%, indirectos 12%, IVA 16%.

El desglose en pantalla (wizard, paso Facturación y Resumen) calcula correctamente
**$23,942.40**. Pero el PDF generado imprime **$4,489.20**:

| PDF actual (mal)                 | Resultado esperado              |
|----------------------------------|---------------------------------|
| Renta por día: 40 día × $430.00  | Renta por día: 40 día × $430.00 |
| Importe renta: ~~$430.00~~       | Importe renta: **$17,200.00**    |
| Subtotal: ~~$430.00~~            | Subtotal: $17,200.00            |
| Utilidad 8.0%: $1,376.00         | Utilidad 8.0%: $1,376.00         |
| Indirectos 12.0%: $2,064.00       | Indirectos 12.0%: $2,064.00      |
| IVA 16%: $619.20                 | IVA 16% (base $20,640.00): $3,302.40 |
| **Total: $4,489.20** ❌           | **Total: $23,942.40** ✅          |

## 2. Causa raíz

El cálculo del wizard (`utils/costBreakdown.js`) **siempre estuvo bien**. El problema es el
contrato entre los 3 servicios:

1. El payload mandaba **tarifas crudas** (`unit_rent_amount: 430`) + `profit_amount` /
   `indirect_amount` precalculados, pero **sin importes por concepto ni subtotal/IVA/total finales**.
2. El spec (`docs/pdf-payload-spec.md` §4) le decía al servicio de PDF que **recalculara**, y su
   fórmula sumaba `unit_rent_amount` **sin multiplicarlo por `unit_rent_qty`** (renta de 40 días
   salía como $430).
3. El servicio mezcló: renglones recalculados mal ($430) + utilidad/indirectos precalculados bien
   ($1,376 / $2,064, calculados sobre $17,200) → base $3,870 → IVA $619.20 → total $4,489.20.

## 3. La regla nueva

**El servicio de PDF no recalcula nada.** El wizard ahora envía el cálculo completo dentro de
`cost_breakdown`. El servicio renderiza esos montos **tal cual**. Las tarifas crudas sirven solo
para armar los textos de las filas ("40 día × $430.00"), **nunca** para el importe.
`profit_pct` / `indirect_pct` solo para las etiquetas de los renglones.

### Campos nuevos en `cost_breakdown` (todos `number`, 2 decimales)

| Campo                 | Significado                                                    |
|-----------------------|----------------------------------------------------------------|
| `casetas_importe`     | Importe final casetas (fijo)                                   |
| `operator_importe`    | `operator_rate × operator_days`                                 |
| `per_diem_importe`    | `per_diem_rate × per_diem_days`                                 |
| `gasoline_importe`    | Fijo, o `gasoline_rate × gasoline_km` si la unidad es `km`      |
| `unit_rent_importe`   | `unit_rent_amount × unit_rent_qty`                              |
| `subtotal_amount`     | Suma de los 5 conceptos                                         |
| `profit_amount`       | Utilidad (ya existía)                                           |
| `indirect_amount`     | Indirectos (ya existía)                                         |
| `base_amount`         | Subtotal + utilidad + indirectos                                 |
| `iva_amount`          | 16% de la base                                                   |
| `total_amount`        | **Total final del documento**                                    |

## 4. Ejemplo de payload (POST `/flotilla/insert?type=renta`)

```json
{
  "subtotal_travel": 17200,
  "profit_pct": 8,
  "indirect_pct": 12,
  "cost_breakdown": {
    "unit_rent_amount": 430,
    "unit_rent_unit": "dia",
    "unit_rent_qty": 40,
    "unit_rent_period": "dia",
    "casetas_importe": 0,
    "operator_importe": 0,
    "per_diem_importe": 0,
    "gasoline_importe": 0,
    "unit_rent_importe": 17200,
    "subtotal_amount": 17200,
    "profit_amount": 1376,
    "indirect_amount": 2064,
    "base_amount": 20640,
    "iva_amount": 3302.40,
    "total_amount": 23942.40
  }
}
```

## 5. Coordinación de los 3 servicios (orden crítico)

### Servicio 1 — Wizard (control-fletes) ✔ LISTO
- `hooks/useDocumentWizard.js` ya envía los 10 montos dentro de `cost_breakdown`.
- Única fuente de verdad del cálculo: `utils/costBreakdown.js` (tests en `utils/costBreakdown.test.js`).
- Spec actualizado: `docs/pdf-payload-spec.md` §3.4 (tabla de campos), §4 (regla + fallback) y §7 (pseudo-código).

### Servicio 2 — API backend (Railway) ⚠ PENDIENTE — HACER PRIMERO
- **Agregar los 10 campos al schema de `cost_breakdown`.** Mongoose con strict mode descarta
  campos no declarados: si no se agregan, se pierden silenciosamente al guardar y el servicio
  de PDF **jamás los verá** (seguiría imprimiendo $430 aunque el wizard ya los envíe).
- Devolverlos en `GET /flotilla/documentos/:empresaId` y en el detalle por documento.
- Aceptarlos también en `PUT /flotilla/documentos/update/:id`.
- **Verificación antes de pasar al servicio 3:** crear un documento de prueba y confirmar que
  el `GET` regresa `total_amount: 23942.40` completo.

### Servicio 3 — Servicio de PDF ⚠ PENDIENTE
- En modo desglose, renderizar `*_importe`, `subtotal_amount`, `profit_amount`,
  `indirect_amount`, `base_amount`, `iva_amount`, `total_amount` **tal cual**.
- Fallback **solo** para documentos legacy sin `*_importe` / `total_amount` (ver §6).
- Sanidad opcional: si `|subtotal_amount − Σ(*_importe)| > 0.01`, loguear la discrepancia.

## 6. Fallback para documentos legacy (sin `*_importe`)

Documentos guardados antes de este cambio. Fórmula corregida — nota el `× unit_rent_qty`:

```
subtotal = casetas_amount
         + operator_rate × (operator_days || dias_periodo)
         + per_diem_rate × (per_diem_days || dias_periodo)
         + (gasoline_unit === 'km' ? gasoline_rate × gasoline_km : gasoline_rate)
         + (unit_rent_unit === 'fijo'
              ? unit_rent_amount
              : unit_rent_amount × (unit_rent_qty || dias_periodo || 1))

base  = subtotal + utilidad + indirectos   // utilidad/indirectos = % del subtotal
iva   = base × 0.16
total = base + iva
// dias_periodo = días entre request_date y delivery_date (mínimo 1)
```

Si el documento trae `profit_amount` / `indirect_amount` persistidos, úsalos; recalcúlalos
solo si no existen.

## 7. Casos de aceptación

| # | Entrada | Esperado en el PDF |
|---|---------|--------------------|
| 1 | Renta 40 día × $430, 8% / 12% / 16% | Renglón $17,200.00, total **$23,942.40** (el caso del bug) |
| 2 | Operador 14 días × $839.22 | Renglón $11,749.08 desde `operator_importe`, sin recalcular |
| 3 | Gasolina fija $500 con `gasoline_km > 0` y unidad ≠ `km` | Renglón $500.00, sin multiplicar por km |
| 4 | Documento legacy sin `*_importe` | Fallback de §6, con renta multiplicada por qty |