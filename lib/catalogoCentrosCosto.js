/**
 * Helpers para consumir el catálogo de centros de costo.
 * La ruta base la define NEXT_PUBLIC_API.
 */

const API = process.env.NEXT_PUBLIC_API

export const CENTROS_COSTO_URL = `${API}/flotilla/catalogos/centros-costo`

/**
 * Normaliza un identificador de centro de costo.
 * Solo minúsculas, números y guiones bajos.
 */
export const normalizeCostCenterId = (value) => {
  if (!value) return ''
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

/**
 * Devuelve las opciones activas listas para un <select> de creación.
 * Respeta el orden devuelto por el backend.
 */
export const getActiveCostCenters = (catalogo) => {
  if (!catalogo || catalogo.status !== 'success' || !Array.isArray(catalogo.data)) return []
  return catalogo.data.filter(c => c.active !== false)
}

/**
 * Devuelve las opciones para edición: activas + el valor actual del documento
 * si ya no está activo (se muestra como inactivo).
 */
export const getCostCenterOptionsForEdit = (catalogo, currentValue) => {
  const activas = getActiveCostCenters(catalogo)
  const options = [...activas]

  const currentId = currentValue || ''
  const isCurrentInactive = currentId && !activas.some(c => c.id === currentId)
  if (isCurrentInactive) {
    options.push({ id: currentId, name: currentId, active: false })
  }

  return options
}
