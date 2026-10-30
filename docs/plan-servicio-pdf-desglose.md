# Plan: Servicio de PDF — desglose sin recalcular (fin del bug del total)

> **Para:** equipo del servicio de PDF (`PDF_SERVICE`, endpoint `POST /vehicle-invoice/`)
> **Fecha:** 2026-09-28 · **Estado:** API lista (PR en api-control-inventario); este es el último paso.
> **Contexto completo:** ver `docs/handoff-desglose-pdf.md` (bug, causa raíz, coordinación).

## 1. Resumen del bug

Documento real: renta de 40 día × $430.00, utilidad 8%, indirectos 12%, IVA 16%.
El PDF imprime **$4,489.20** en vez de **$23,942.40**, porque el servicio de PDF
recalcula el importe de renta **sin multiplicar por `unit_rent_qty`** ($430 en vez
de $430 × 40 = $17,200) y luego suma utilidad/indirectos precalculados sobre la
base correcta.

**La regla nueva es simple: el servicio de PDF no recalcula nada.** El wizard
envía el cálculo completo, la API (Servicio 2) ya lo persiste tal cual y lo entrega
en `cost_breakdown`. El PDF solo renderiza.

## 2. Qué recibe ahora el servicio de PDF

`POST /vehicle-invoice/` recibe el payload de `vehicleData` (API api-control-inventario,
`FlotillasController.printPlan` → `PDFServices.vehicleData`). Dentro de
`cost_breakdown`, además de las tarifas crudas que ya conocen, ahora llegan:

| Campo                | Significado                                    |
|----------------------|------------------------------------------------|
| `casetas_importe`    | Importe final casetas (fijo)                    |
| `operator_importe`   | `operator_rate × operator_days`                |
| `per_diem_importe`   | `per_diem_rate × per_diem_days`                |
| `gasoline_importe`   | Fijo, o `gasoline_rate × gasoline_km` si unidad es `km` |
| `unit_rent_importe`  | `unit_rent_amount × unit_rent_qty`             |
| `subtotal_amount`    | Suma de los 5 conceptos                        |
| `profit_amount`      | Utilidad (ya existía)                          |
| `indirect_amount`    | Indirectos (ya existía)                        |
| `base_amount`        | Subtotal + utilidad + indirectos               |
| `iva_amount`         | 16% de la base                                |
| `total_amount`       | **Total final del documento**                  |

### Semántica de ausencia (importante, nueva)

La API guarda estos campos **sin default**: un documento que no los trae los tiene
**ausentes (`undefined`), nunca `0`**. Eso es deliberado, para que puedas distinguir:

- `total_amount == null/undefined` → documento **legacy** (o sin desglose calculado) → usar el fallback de §3.
- `total_amount` presente (aunque sea `0.00` válido) → renderizar **tal cual**.

**No uses `|| 0` ni `|| subtotal` sobre estos campos** en la detección: rompería la
distinción. Usa `!= null && !== undefined`.

## 3. Implementación paso a paso

### 3.1 Modo desglose con montos presentes (el camino normal)

1. Detecta si `cost_breakdown.total_amount != null` (y `subtotal_amount != null`).
2. Renderiza cada renglón con su `*_importe` **verbatim**, formateado a 2 decimales:
   - Fila de texto con tarifas crudas: `"40 día × $430.00"` (solo texto, nunca para el importe).
   - Importe de fila: `unit_rent_importe` tal cual.
   - Subtotal: `subtotal_amount`.
   - `profit_pct` / `indirect_pct` solo para las etiquetas ("Utilidad 8.0%").
   - Utilidad: `profit_amount`. Indirectos: `indirect_amount`.
   - Base: `base_amount` (etiquetar IVA con la base: "IVA 16% (base $20,640.00)").
   - IVA: `iva_amount`. **Total: `total_amount`.**
3. **Sanidad opcional:** si `|subtotal_amount − Σ(*_importe)| > 0.01`, loguear la
   discrepancia (no corregirla, no fallar).

### 3.2 Fallback para documentos legacy (sin `*_importe` / `total_amount`)

Documentos guardados antes de este cambio. **La fórmula corregida** — nota el
`× unit_rent_qty` que faltaba:

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

Si el documento trae `profit_amount` / `indirect_amount` persistidos, úsalos;
recalcúlalos solo si no existen.

### 3.3 Caso gasolina fija

`gasoline_importe` ya viene resuelto (fijo aunque `gasoline_km > 0` y unidad ≠ `km`).
En legacy: si `gasoline_unit !== 'km'`, el importe es `gasoline_rate` **sin
multiplicar por `gasoline_km`**.

## 4. Casos de aceptación

| # | Entrada | Esperado en el PDF |
|---|---------|--------------------|
| 1 | Renta 40 día × $430, 8% / 12% / 16% | Renglón $17,200.00, total **$23,942.40** (el caso del bug) |
| 2 | Operador 14 días × $839.22 | Renglón $11,749.08 desde `operator_importe`, sin recalcular |
| 3 | Gasolina fija $500 con `gasoline_km > 0` y unidad ≠ `km` | Renglón $500.00, sin multiplicar por km |
| 4 | Documento legacy sin `*_importe` | Fallback de §3.2, con renta multiplicada por qty |
| 5 | `total_amount == null` pero tarifas presentes | Fallback de §3.2 (no renderizar $0.00) |

## 5. Qué ya está listo (no lo toques)

- **Wizard** (`control-fletes`): envía los 10 montos dentro de `cost_breakdown`. Cálculo en `utils/costBreakdown.js`.
- **API** (`api-control-inventario`, PR "feat(flotillas): persiste importes finales de cost_breakdown"):
  - Schema de `cost_breakdown` con los 9 campos nuevos (sin default) en `models/CostBreakdown.js`.
  - `mapDocumentBody` lee el payload anidado del wizard (con fallback plano) en insert y update.
  - `GET /api/v1/flotilla/documentos/:idBussines` y el detalle ya devuelven los campos nuevos sin cambios extra.
  - `vehicleData` los propaga al servicio de PDF vía spread (`PDFServices.js:1007`).

## 6. Verificación end-to-end (después de deployar API y PDF)

1. Crear un documento de prueba desde el wizard (renta 40 día × $430, 8%/12%/16%).
2. `GET /api/v1/flotilla/documentos/:empresaId` debe regresar `cost_breakdown.total_amount: 23942.40` completo.
3. Imprimir el PDF (`POST /api/v1/flotilla/plan/print/:idDocument?type=renta`) → total **$23,942.40**.
4. Imprimir un documento legacy (creado antes del cambio) → fallback, con renta × qty.