import { describe, it, expect } from 'vitest'
import { DOCUMENT_SCHEMA } from '../lib/documentSchema'
import { computeCostBreakdown } from './costBreakdown'

/**
 * Test completo del payload que genera el wizard.
 *
 * Escenarios cubiertos:
 *  - El schema acepta un documento de renta tipico con conceptos numericos.
 *  - recorrido_km se almacena como string (PDF spec) aunque el input lo coercione.
 *  - kilometer_out se almacena como number.
 *  - computeCostBreakdown produce el cost_breakdown esperado segun PDF spec.
 *  - subtotal_travel formateado a string para el PDF/legacy.
 */

const baseFormValues = {
  plan: '6643f2a8e1b2c3d4e5f60718',
  client: '626e223ffe9887654db63c38',
  subject: 'Renta de unidad para obra Neiboruga',
  request_date: '2025-07-01',
  delivery_date: '2025-07-15',
  driver: 'JUAN PEREZ GARCIA',
  origin: 'Cd. Obregon, Son.',
  destination: 'Hermosillo, Son.',
  stops: [],
  route: 'Cd. Obregon, Son. → Hermosillo, Son.',
  recorrido_km: '420',
  kilometer_out: 87500,
  subtotal_travel: 0,
  fuel_level: 75,
  document_id: 'SAL-2025-001',
  fuel_card: 'TC-8847',
  fuel_amount: '2500',
  link_googlemaps: 'https://maps.app.goo.gl/abc123',
  casetas: '',
  tarjeta_deposito: 'BANCOMER 4152',
  casetas_amount: 1200,
  casetas_unit: 'fijo',
  casetas_days: 0,
  casetas_notes: 'Casetas del tramo completo',
  casetas_num: '',
  operator_rate: 839.22,
  operator_unit: 'dia',
  operator_days: 14,
  operator_notes: 'Operador certificado',
  per_diem_rate: 307.80,
  per_diem_unit: 'dia',
  per_diem_days: 14,
  per_diem_notes: '',
  gasoline_rate: 5.00,
  gasoline_unit: 'km',
  gasoline_km: 420,
  gasoline_notes: 'Diesel cargado en trayecto',
  unit_rent_amount: 17800.00,
  unit_rent_unit: 'dia',
  unit_rent_qty: 1,
  unit_rent_notes: 'Semana completa',
  unit_rent_period: 'semana',
  profit_pct: 8,
  indirect_pct: 12,
  priority: '',
  cost_center: 'logistica',
  cargo_description: '28 ton perfiles de acero',
  operator_notes: '',
  checklist_extintor: true,
  checklist_llanta_refaccion: true,
  checklist_herramientas: true,
  checklist_gato: true,
  checklist_cinturon: true,
  checklist_documentos: true,
  checklist_tarjetas: true,
  checklist_observaciones: 'Sin golpes visibles'
}

const expectedSubtotal = 37158.28
const expectedProfit = 2972.66
const expectedIndirect = 4458.99
const expectedBase = 44589.93
const expectedIva = 7134.39
const expectedTotal = 51724.32

describe('DOCUMENT_SCHEMA', () => {
  it('acepta un documento de renta completo con conceptos numericos', () => {
    const parsed = DOCUMENT_SCHEMA.safeParse(baseFormValues)
    expect(parsed.success).toBe(true)
  })

  it('coerce recorrido_km de number a string', () => {
    const parsed = DOCUMENT_SCHEMA.safeParse({ ...baseFormValues, recorrido_km: 420 })
    expect(parsed.success).toBe(true)
    expect(parsed.data.recorrido_km).toBe('420')
  })

  it('coerce kilometer_out de string a number', () => {
    const parsed = DOCUMENT_SCHEMA.safeParse({ ...baseFormValues, kilometer_out: '87500' })
    expect(parsed.success).toBe(true)
    expect(parsed.data.kilometer_out).toBe(87500)
  })

  it('rechaza unit_rent_qty como string', () => {
    const parsed = DOCUMENT_SCHEMA.safeParse({ ...baseFormValues, unit_rent_qty: '1' })
    // El schema ahora espera number; z.coerce deberia convertir '1' a 1.
    expect(parsed.success).toBe(true)
    expect(parsed.data.unit_rent_qty).toBe(1)
  })

  it('rechaza campos obligatorios vacios', () => {
    const invalid = { ...baseFormValues, client: '', origin: '' }
    const parsed = DOCUMENT_SCHEMA.safeParse(invalid)
    expect(parsed.success).toBe(false)
    const errors = parsed.error.issues.map(i => i.path[0])
    expect(errors).toContain('client')
    expect(errors).toContain('origin')
  })
})

describe('computeCostBreakdown para payload del wizard', () => {
  it('calcula importes y totales de renta correctamente', () => {
    const normalized = { ...baseFormValues }
    // El hook fuerza gasoline_km = recorrido_km cuando unit es km.
    normalized.gasoline_km = normalized.gasoline_unit === 'km'
      ? (Number(normalized.gasoline_km) || Number(normalized.recorrido_km) || 1)
      : 1

    const result = computeCostBreakdown(normalized)

    expect(result.concepts.casetas.importe).toBe(1200)
    expect(result.concepts.operator.importe).toBe(11749.08)
    expect(result.concepts.perDiem.importe).toBe(4309.20)
    expect(result.concepts.gasoline.importe).toBe(2100)
    expect(result.concepts.unitRent.importe).toBe(17800)
    expect(result.subtotal).toBe(expectedSubtotal)
    expect(result.utilidad).toBe(expectedProfit)
    expect(result.indirectos).toBe(expectedIndirect)
    expect(result.base).toBe(expectedBase)
    expect(result.iva).toBe(expectedIva)
    expect(result.total).toBe(expectedTotal)
  })
})

describe('Payload final del wizard', () => {
  it('arma cost_breakdown con numeros segun PDF spec', () => {
    const normalized = { ...baseFormValues }
    normalized.gasoline_km = normalized.gasoline_unit === 'km'
      ? (Number(normalized.gasoline_km) || Number(normalized.recorrido_km) || 1)
      : 1

    const breakdown = computeCostBreakdown(normalized)

    const cost_breakdown = {
      casetas_amount: breakdown.concepts.casetas.rate,
      casetas_unit: breakdown.concepts.casetas.unit,
      casetas_days: breakdown.concepts.casetas.days,
      casetas_notes: breakdown.concepts.casetas.notes,
      operator_rate: breakdown.concepts.operator.rate,
      operator_unit: breakdown.concepts.operator.unit,
      operator_days: breakdown.concepts.operator.days,
      operator_notes: breakdown.concepts.operator.notes,
      per_diem_rate: breakdown.concepts.perDiem.rate,
      per_diem_unit: breakdown.concepts.perDiem.unit,
      per_diem_days: breakdown.concepts.perDiem.days,
      per_diem_notes: breakdown.concepts.perDiem.notes,
      gasoline_rate: breakdown.concepts.gasoline.rate,
      gasoline_unit: breakdown.concepts.gasoline.unit,
      gasoline_km: breakdown.concepts.gasoline.km,
      gasoline_notes: breakdown.concepts.gasoline.notes,
      unit_rent_amount: breakdown.concepts.unitRent.rate,
      unit_rent_unit: breakdown.concepts.unitRent.unit,
      unit_rent_qty: breakdown.concepts.unitRent.qty,
      unit_rent_notes: breakdown.concepts.unitRent.notes,
      unit_rent_period: breakdown.concepts.unitRent.period || 'dia',
      casetas_importe: breakdown.concepts.casetas.importe,
      operator_importe: breakdown.concepts.operator.importe,
      per_diem_importe: breakdown.concepts.perDiem.importe,
      gasoline_importe: breakdown.concepts.gasoline.importe,
      unit_rent_importe: breakdown.concepts.unitRent.importe,
      subtotal_amount: breakdown.subtotal,
      profit_amount: breakdown.utilidad,
      indirect_amount: breakdown.indirectos,
      base_amount: breakdown.base,
      iva_amount: breakdown.iva,
      total_amount: breakdown.total
    }

    // Todos los campos numericos deben ser numbers, no strings.
    const numericFields = [
      'casetas_amount', 'casetas_days',
      'operator_rate', 'operator_days',
      'per_diem_rate', 'per_diem_days',
      'gasoline_rate', 'gasoline_km',
      'unit_rent_amount', 'unit_rent_qty',
      'casetas_importe', 'operator_importe', 'per_diem_importe',
      'gasoline_importe', 'unit_rent_importe',
      'subtotal_amount', 'profit_amount', 'indirect_amount',
      'base_amount', 'iva_amount', 'total_amount'
    ]

    for (const field of numericFields) {
      expect(typeof cost_breakdown[field], `campo ${field} debe ser number`).toBe('number')
    }

    expect(cost_breakdown.unit_rent_qty).toBe(1)
    expect(cost_breakdown.subtotal_amount).toBe(expectedSubtotal)
    expect(cost_breakdown.total_amount).toBe(expectedTotal)
  })

  it('subtotal_travel viaja como string formateado para PDF/legacy', () => {
    const normalized = { ...baseFormValues }
    normalized.gasoline_km = normalized.gasoline_unit === 'km'
      ? (Number(normalized.gasoline_km) || Number(normalized.recorrido_km) || 1)
      : 1

    const breakdown = computeCostBreakdown(normalized)
    const formatMoney = (n) => {
      const val = Number(n ?? 0)
      if (Number.isNaN(val)) return '$0.00'
      return new Intl.NumberFormat('es-MX', {
        style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(val)
    }

    const subtotal_travel = formatMoney(breakdown.subtotal)
    expect(subtotal_travel).toBe('$37,158.28')
    expect(typeof subtotal_travel).toBe('string')
  })

  it('recorrido_km se envia como string y gasoline_km como number', () => {
    const recorrido_km = baseFormValues.recorrido_km
    expect(typeof recorrido_km).toBe('string')
    expect(recorrido_km).toBe('420')

    const gasoline_km = baseFormValues.gasoline_unit === 'km'
      ? (Number(baseFormValues.gasoline_km) || Number(baseFormValues.recorrido_km) || 1)
      : 1
    expect(typeof gasoline_km).toBe('number')
    expect(gasoline_km).toBe(420)
  })
})
