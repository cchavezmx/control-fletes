import { describe, it, expect } from 'vitest'
import {
  num,
  roundMoney,
  computeDiasPeriodo,
  computeConceptTotal,
  computeCostBreakdown
} from './costBreakdown'

describe('num', () => {
  it('convierte strings vacíos, null y undefined a 0', () => {
    expect(num('')).toBe(0)
    expect(num(null)).toBe(0)
    expect(num(undefined)).toBe(0)
  })

  it('convierte strings numéricos a number', () => {
    expect(num('839.22')).toBe(839.22)
    expect(num('14')).toBe(14)
  })

  it('respeta 0 y valores negativos', () => {
    expect(num(0)).toBe(0)
    expect(num(-10)).toBe(-10)
  })
})

describe('roundMoney', () => {
  it('redondea a 2 decimales', () => {
    expect(roundMoney(10.555)).toBe(10.56)
    expect(roundMoney(10.554)).toBe(10.55)
    expect(roundMoney(10.5)).toBe(10.5)
  })

  it('maneja NaN como 0', () => {
    expect(roundMoney('no')).toBe(0)
  })
})

describe('computeDiasPeriodo', () => {
  it('calcula 14 días entre 2025-07-01 y 2025-07-15', () => {
    expect(computeDiasPeriodo('2025-07-01', '2025-07-15')).toBe(14)
  })

  it('devuelve 1 si falta alguna fecha', () => {
    expect(computeDiasPeriodo(null, '2025-07-15')).toBe(1)
    expect(computeDiasPeriodo('2025-07-01', undefined)).toBe(1)
  })

  it('devuelve 1 si delivery_date es anterior', () => {
    expect(computeDiasPeriodo('2025-07-15', '2025-07-01')).toBe(1)
  })
})

describe('computeConceptTotal', () => {
  it('casetas fijas: devuelve el monto', () => {
    expect(computeConceptTotal({ rate: 1200, unit: 'fijo', qty: 0, fixed: true })).toBe(1200)
  })

  it('operador por día: rate × days', () => {
    expect(computeConceptTotal({ rate: 839.22, unit: 'dia', qty: 14, diasPeriodo: 14 })).toBe(11749.08)
  })

  it('usa diasPeriodo cuando qty es 0', () => {
    expect(computeConceptTotal({ rate: 500, unit: 'dia', qty: 0, diasPeriodo: 3 })).toBe(1500)
  })

  it('devuelve 0 cuando rate es 0', () => {
    expect(computeConceptTotal({ rate: 0, unit: 'dia', qty: 14, diasPeriodo: 14 })).toBe(0)
  })
})

describe('computeCostBreakdown', () => {
  it('caso feliz: renta 14 días igual al ejemplo del PDF (gasolina por km)', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-15',
      profit_pct: 8,
      indirect_pct: 12,
      cost_breakdown: {
        casetas_amount: 1200,
        operator_rate: 839.22,
        operator_days: 14,
        per_diem_rate: 307.80,
        per_diem_days: 14,
        gasoline_rate: 5.00,
        gasoline_km: 420,
        gasoline_unit: 'km',
        unit_rent_amount: 17800.00,
        unit_rent_period: 'semana',
        profit_amount: 666.16,
        indirect_amount: 999.24
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.concepts.casetas.importe).toBe(1200)
    expect(result.concepts.operator.importe).toBe(11749.08)
    expect(result.concepts.perDiem.importe).toBe(4309.20)
    expect(result.concepts.gasoline.importe).toBe(2100)
    expect(result.concepts.unitRent.importe).toBe(17800)
    expect(result.subtotal).toBe(37158.28)
    expect(result.utilidad).toBe(666.16)
    expect(result.indirectos).toBe(999.24)
    expect(result.base).toBe(38823.68)
    expect(result.iva).toBe(6211.79)
    expect(result.total).toBe(45035.47)
  })

  it('flete con operador y viáticos', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-03',
      profit_pct: 8,
      indirect_pct: 12,
      cost_breakdown: {
        operator_rate: 1000,
        operator_days: 2,
        per_diem_rate: 500,
        per_diem_days: 2
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.concepts.operator.importe).toBe(2000)
    expect(result.concepts.perDiem.importe).toBe(1000)
    expect(result.subtotal).toBe(3000)
    expect(result.utilidad).toBe(240)
    expect(result.indirectos).toBe(360)
    expect(result.base).toBe(3600)
    expect(result.iva).toBe(576)
    expect(result.total).toBe(4176)
  })

  it('traslado legacy sin cost_breakdown: usa subtotal_travel como fallback', () => {
    const doc = {
      subtotal_travel: 5000,
      profit_pct: 8,
      indirect_pct: 12
    }

    const result = computeCostBreakdown(doc)

    expect(result.subtotal).toBe(5000)
    expect(result.hasCosts).toBe(true)
    expect(result.hasBreakdown).toBe(false)
    expect(result.utilidad).toBe(400)
    expect(result.indirectos).toBe(600)
    expect(result.base).toBe(6000)
    expect(result.iva).toBe(960)
    expect(result.total).toBe(6960)
  })

  it('porcentajes 0%: utilidad e indirectos quedan en 0', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-02',
      profit_pct: 0,
      indirect_pct: 0,
      cost_breakdown: {
        operator_rate: 1000,
        operator_days: 1
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.subtotal).toBe(1000)
    expect(result.utilidad).toBe(0)
    expect(result.indirectos).toBe(0)
    expect(result.base).toBe(1000)
    expect(result.iva).toBe(160)
    expect(result.total).toBe(1160)
  })

  it('gasolina fija por default (comportamiento actual wizard)', () => {
    const doc = {
      cost_breakdown: {
        gasoline_rate: 2500
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.concepts.gasoline.importe).toBe(2500)
    expect(result.concepts.gasoline.unit).toBe('fijo')
  })

  it('gasolina por km cuando unit es km y hay kilómetros', () => {
    const doc = {
      cost_breakdown: {
        gasoline_rate: 5,
        gasoline_km: 420,
        gasoline_unit: 'km'
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.concepts.gasoline.importe).toBe(2100)
  })

  it('renta con qty ausente usa default 1', () => {
    const doc = {
      cost_breakdown: {
        unit_rent_amount: 5000
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.concepts.unitRent.qty).toBe(1)
    expect(result.concepts.unitRent.importe).toBe(5000)
  })

  it('días ausentes en operador/viáticos usan diasPeriodo por defecto', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-05',
      cost_breakdown: {
        operator_rate: 1000,
        per_diem_rate: 300
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.diasPeriodo).toBe(4)
    expect(result.concepts.operator.importe).toBe(4000)
    expect(result.concepts.perDiem.importe).toBe(1200)
  })

  it('valores string se coercen correctamente', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-02',
      cost_breakdown: {
        operator_rate: '839.22',
        operator_days: '14',
        per_diem_rate: '307.80',
        per_diem_days: '14',
        unit_rent_amount: '17800.00',
        unit_rent_qty: '1'
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.concepts.operator.importe).toBe(11749.08)
    expect(result.concepts.perDiem.importe).toBe(4309.20)
    expect(result.concepts.unitRent.importe).toBe(17800)
  })

  it('documento legacy top-level (sin cost_breakdown anidado)', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-15',
      profit_pct: 8,
      indirect_pct: 12,
      casetas_amount: 1200,
      operator_rate: 839.22,
      operator_days: 14,
      per_diem_rate: 307.80,
      per_diem_days: 14,
      gasoline_rate: 5.00,
      gasoline_km: 420,
      gasoline_unit: 'km',
      unit_rent_amount: 17800.00
    }

    const result = computeCostBreakdown(doc)

    expect(result.subtotal).toBe(37158.28)
    expect(result.base).toBe(44589.93) // recalculado porque no hay montos persistidos
  })

  it('preferir montos persistidos sobre porcentajes', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-02',
      profit_pct: 8,
      indirect_pct: 12,
      cost_breakdown: {
        operator_rate: 1000,
        operator_days: 1,
        profit_amount: 50,
        indirect_amount: 75
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.subtotal).toBe(1000)
    expect(result.utilidad).toBe(50)
    expect(result.indirectos).toBe(75)
    expect(result.base).toBe(1125)
    expect(result.iva).toBe(180)
    expect(result.total).toBe(1305)
  })

  it('monto persistido 0 no es confundido con ausente', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-02',
      profit_pct: 8,
      indirect_pct: 12,
      cost_breakdown: {
        operator_rate: 1000,
        operator_days: 1,
        profit_amount: 0,
        indirect_amount: 0
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.utilidad).toBe(0)
    expect(result.indirectos).toBe(0)
  })

  it('decimales con drift no acumulan error', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-02',
      profit_pct: 8,
      indirect_pct: 12,
      cost_breakdown: {
        operator_rate: 1000.555,
        operator_days: 1
      }
    }

    const result = computeCostBreakdown(doc)

    expect(result.subtotal).toBe(1000.56)
    expect(result.utilidad).toBe(80.04)
    expect(result.indirectos).toBe(120.07)
    expect(result.base).toBe(1200.67)
    expect(result.iva).toBe(192.11)
    expect(result.total).toBe(1392.78)
  })

  it('idempotencia: recalcular el mismo objeto da igual resultado', () => {
    const doc = {
      request_date: '2025-07-01',
      delivery_date: '2025-07-15',
      profit_pct: 8,
      indirect_pct: 12,
      cost_breakdown: {
        casetas_amount: 1200,
        operator_rate: 839.22,
        operator_days: 14,
        per_diem_rate: 307.80,
        per_diem_days: 14,
        gasoline_rate: 5.00,
        gasoline_km: 420,
        unit_rent_amount: 17800.00,
        profit_amount: 666.16,
        indirect_amount: 999.24
      }
    }

    const first = computeCostBreakdown(doc)
    const second = computeCostBreakdown(doc)

    expect(second).toEqual(first)
  })

  it('hasBreakdown es false cuando todos los conceptos son 0', () => {
    const result = computeCostBreakdown({})

    expect(result.hasBreakdown).toBe(false)
    expect(result.hasCosts).toBe(false)
  })
})
