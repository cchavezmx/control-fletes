/**
 * Cálculo puro del desglose de conceptos, utilidad, indirectos, IVA y total.
 *
 * Soporta:
 *   - Documentos legacy con campos planos (doc.casetas_amount, etc.).
 *   - Documentos nuevos con subdocumento doc.cost_breakdown.
 *   - Valores del wizard (strings numéricos, días/qty opcionales).
 *
 * La regla de negocio es:
 *   subtotal = suma de importes por concepto
 *   utilidad   = subtotal × (profit_pct / 100)
 *   indirectos = subtotal × (indirect_pct / 100)
 *   base       = subtotal + utilidad + indirectos
 *   iva        = base × iva_rate
 *   total      = base + iva
 *
 * Todos los montos se redondean a 2 decimales para evitar drift de punto flotante.
 */

export const num = (v) => Number(v || 0)

export const roundMoney = (n) => {
  const val = Number(n)
  if (Number.isNaN(val)) return 0
  return Math.round(val * 100) / 100
}

export const computeConceptTotal = ({ rate, unit, qty, diasPeriodo = 1, fixed = false }) => {
  const r = num(rate)
  if (!r) return 0
  if (fixed || unit === 'fijo') return roundMoney(r)

  let cant = num(qty)
  if (!cant) {
    cant = num(diasPeriodo) || 1
  }
  return roundMoney(r * cant)
}

export const computeDiasPeriodo = (requestDate, deliveryDate) => {
  if (!requestDate || !deliveryDate) return 1
  const d = Math.round((new Date(deliveryDate) - new Date(requestDate)) / 86400000)
  return d > 0 ? d : 1
}

const FIELD_DEFAULTS = {
  casetas_unit: 'fijo',
  operator_unit: 'dia',
  per_diem_unit: 'dia',
  gasoline_unit: 'fijo',
  unit_rent_unit: 'dia',
  unit_rent_qty: 1,
  profit_pct: 8,
  indirect_pct: 12,
  iva_rate: 0.16
}

/**
 * Lee un campo que puede venir en cost_breakdown o a nivel legacy.
 * Prioriza el subdocumento; si no existe o es null/undefined, cae al top-level.
 */
const readField = (doc, cb, key, fallback) => {
  if (cb && cb[key] !== undefined && cb[key] !== null) return cb[key]
  if (doc && doc[key] !== undefined && doc[key] !== null) return doc[key]
  return fallback
}

/**
 * Calcula el desglose de costos de un documento o formulario.
 *
 * @param {Object} doc - documento del backend o valores del formulario.
 * @param {Object} options
 * @param {number} options.diasPeriodo - días a usar como default para conceptos por día.
 * @param {number} options.defaultProfitPct - default para utilidad (default 8).
 * @param {number} options.defaultIndirectPct - default para indirectos (default 12).
 * @param {number} options.ivaRate - default 0.16.
 * @returns {Object} desglose calculado.
 */
export const computeCostBreakdown = (doc = {}, options = {}) => {
  const cb = doc.cost_breakdown || {}
  const diasPeriodo = options.diasPeriodo ?? computeDiasPeriodo(doc.request_date, doc.delivery_date) ?? 1
  const defaultProfitPct = options.defaultProfitPct ?? FIELD_DEFAULTS.profit_pct
  const defaultIndirectPct = options.defaultIndirectPct ?? FIELD_DEFAULTS.indirect_pct
  const ivaRate = options.ivaRate ?? FIELD_DEFAULTS.iva_rate

  const casetas = {
    rate: readField(doc, cb, 'casetas_amount', 0),
    unit: readField(doc, cb, 'casetas_unit', FIELD_DEFAULTS.casetas_unit),
    days: readField(doc, cb, 'casetas_days', 0),
    notes: readField(doc, cb, 'casetas_notes', '')
  }

  const operator = {
    rate: readField(doc, cb, 'operator_rate', 0),
    unit: readField(doc, cb, 'operator_unit', FIELD_DEFAULTS.operator_unit),
    days: readField(doc, cb, 'operator_days', 0),
    notes: readField(doc, cb, 'operator_notes', '')
  }

  const perDiem = {
    rate: readField(doc, cb, 'per_diem_rate', 0),
    unit: readField(doc, cb, 'per_diem_unit', FIELD_DEFAULTS.per_diem_unit),
    days: readField(doc, cb, 'per_diem_days', 0),
    notes: readField(doc, cb, 'per_diem_notes', '')
  }

  const gasoline = {
    rate: readField(doc, cb, 'gasoline_rate', 0),
    unit: readField(doc, cb, 'gasoline_unit', FIELD_DEFAULTS.gasoline_unit),
    km: readField(doc, cb, 'gasoline_km', doc.gasoline_days ?? 0),
    notes: readField(doc, cb, 'gasoline_notes', '')
  }

  const unitRent = {
    rate: readField(doc, cb, 'unit_rent_amount', 0),
    unit: readField(doc, cb, 'unit_rent_unit', FIELD_DEFAULTS.unit_rent_unit),
    qty: readField(doc, cb, 'unit_rent_qty', FIELD_DEFAULTS.unit_rent_qty),
    period: readField(doc, cb, 'unit_rent_period', ''),
    notes: readField(doc, cb, 'unit_rent_notes', '')
  }

  const casetasImporte = computeConceptTotal({ rate: casetas.rate, unit: casetas.unit, qty: casetas.days, fixed: true })
  const operatorImporte = computeConceptTotal({ rate: operator.rate, unit: operator.unit, qty: operator.days, diasPeriodo })
  const perDiemImporte = computeConceptTotal({ rate: perDiem.rate, unit: perDiem.unit, qty: perDiem.days, diasPeriodo })

  // Gasolina: por defecto es monto fijo (comportamiento actual del wizard).
  // Si la unidad es 'km' y hay kilómetros, se multiplica rate × km (spec del PDF).
  const gasolineImporte = (gasoline.unit === 'km' && num(gasoline.km) > 0)
    ? roundMoney(num(gasoline.rate) * num(gasoline.km))
    : roundMoney(num(gasoline.rate))

  const unitRentImporte = computeConceptTotal({
    rate: unitRent.rate,
    unit: unitRent.unit,
    qty: unitRent.qty,
    diasPeriodo,
    fixed: unitRent.unit === 'fijo'
  })

  casetas.importe = casetasImporte
  operator.importe = operatorImporte
  perDiem.importe = perDiemImporte
  gasoline.importe = gasolineImporte
  unitRent.importe = unitRentImporte

  const conceptSubtotal = roundMoney(
    casetasImporte +
    operatorImporte +
    perDiemImporte +
    gasolineImporte +
    unitRentImporte
  )

  // Fallback a subtotal_travel para documentos legacy que no tienen desglose.
  const legacySubtotal = num(doc.subtotal_travel)
  const subtotal = conceptSubtotal > 0 ? conceptSubtotal : legacySubtotal

  const profitPct = num(readField(doc, cb, 'profit_pct', defaultProfitPct))
  const indirectPct = num(readField(doc, cb, 'indirect_pct', defaultIndirectPct))

  // Si el documento ya tiene montos persistidos, preferirlos; sino recalcular.
  // Se usa != null en lugar de || para no confundir 0 con ausente.
  const persistedProfit = cb.profit_amount ?? doc.profit_amount
  const persistedIndirect = cb.indirect_amount ?? doc.indirect_amount

  const utilidad = persistedProfit != null
    ? roundMoney(persistedProfit)
    : roundMoney(subtotal * (profitPct / 100))

  const indirectos = persistedIndirect != null
    ? roundMoney(persistedIndirect)
    : roundMoney(subtotal * (indirectPct / 100))

  const base = roundMoney(subtotal + utilidad + indirectos)
  const iva = roundMoney(base * ivaRate)
  const total = roundMoney(base + iva)

  const hasCosts = !!(conceptSubtotal > 0 || legacySubtotal > 0 ||
    num(casetas.rate) || num(operator.rate) || num(perDiem.rate) ||
    num(gasoline.rate) || num(unitRent.rate))

  const hasBreakdown = Object.entries({
    casetas: casetasImporte,
    operator: operatorImporte,
    perDiem: perDiemImporte,
    gasoline: gasolineImporte,
    unitRent: unitRentImporte
  }).some(([, v]) => v > 0)

  return {
    concepts: {
      casetas,
      operator,
      perDiem,
      gasoline,
      unitRent
    },
    diasPeriodo,
    subtotal,
    profitPct,
    indirectPct,
    utilidad,
    indirectos,
    base,
    iva,
    total,
    hasCosts,
    hasBreakdown
  }
}

export default computeCostBreakdown
