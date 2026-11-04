import { describe, it, expect } from 'vitest'
import { getActiveCostCenters, getCostCenterOptionsForEdit } from './catalogoCentrosCosto'

const mockCatalogo = {
  status: 'success',
  data: [
    { id: 'logistica', name: 'Logística', active: true, normalized: 'logistica' },
    { id: 'operaciones', name: 'Operaciones', active: true, normalized: 'operaciones' },
    { id: 'comercial', name: 'Comercial', active: false, normalized: 'comercial' },
    { id: 'administracion', name: 'Administración', active: true, normalized: 'administracion' }
  ]
}

describe('getActiveCostCenters', () => {
  it('devuelve solo las opciones activas en el orden del backend', () => {
    const result = getActiveCostCenters(mockCatalogo)
    expect(result).toHaveLength(3)
    expect(result.map(c => c.id)).toEqual(['logistica', 'operaciones', 'administracion'])
  })

  it('devuelve array vacío si el catálogo tiene status de error', () => {
    const result = getActiveCostCenters({ status: 'error', data: mockCatalogo.data })
    expect(result).toEqual([])
  })

  it('devuelve array vacío si no hay catálogo', () => {
    expect(getActiveCostCenters(null)).toEqual([])
    expect(getActiveCostCenters(undefined)).toEqual([])
  })

  it('devuelve array vacío si data no es un array', () => {
    expect(getActiveCostCenters({ status: 'success', data: {} })).toEqual([])
    expect(getActiveCostCenters({ status: 'success' })).toEqual([])
  })
})

describe('getCostCenterOptionsForEdit', () => {
  it('devuelve activas más el valor actual inactivo', () => {
    const result = getCostCenterOptionsForEdit(mockCatalogo, 'comercial')
    expect(result).toHaveLength(4)
    expect(result.map(c => c.id)).toEqual(['logistica', 'operaciones', 'administracion', 'comercial'])
    const inactivo = result.find(c => c.id === 'comercial')
    expect(inactivo.active).toBe(false)
  })

  it('no duplica el valor actual si ya está activo', () => {
    const result = getCostCenterOptionsForEdit(mockCatalogo, 'logistica')
    expect(result).toHaveLength(3)
    expect(result.map(c => c.id)).toEqual(['logistica', 'operaciones', 'administracion'])
  })

  it('ignora valor actual vacío', () => {
    const result = getCostCenterOptionsForEdit(mockCatalogo, '')
    expect(result).toHaveLength(3)
  })

  it('ignora valor actual nulo', () => {
    const result = getCostCenterOptionsForEdit(mockCatalogo, null)
    expect(result).toHaveLength(3)
  })

  it('devuelve solo el valor actual si no hay catálogo', () => {
    const result = getCostCenterOptionsForEdit(null, 'logistica')
    expect(result).toEqual([{ id: 'logistica', name: 'logistica', active: false }])
  })
})
