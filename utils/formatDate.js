import dayjs from 'dayjs'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/**
 * El backend devuelve fechas de calendario de distintas formas:
 *   - "2026-08-07"                     (ISO date-only)
 *   - "2026-08-07T00:00:00.000Z"       (UTC midnight)
 *   - "07/08/2026"                     (ya formateado por getRowData)
 *   - Date object
 *
 * Para fechas de calendario (sin hora concreta) queremos mostrar el mismo
 * día independientemente del husillo del navegador, igual que el PDF.
 * Si viene una hora real, se interpreta como instante local.
 */
export const parseDateLocal = (dateStr) => {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr

  const str = dateStr.toString().trim()

  // DD/MM/YYYY (formato que usa getRowData para la DataGrid antigua)
  if (str.includes('/')) {
    const [d, m, y] = str.split('/')
    const dt = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00`)
    return isNaN(dt) ? null : dt
  }

  // ISO date-only o ISO datetime con hora 00:00:00 UTC -> fecha de calendario
  const isoDateMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.\d+)?Z?)?$/)
  if (isoDateMatch) {
    const dt = new Date(`${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}T00:00:00`)
    return isNaN(dt) ? null : dt
  }

  // Cualquier otro datetime: usamos el Date nativo (interpreta la zona que traiga)
  const dt = new Date(str)
  return isNaN(dt) ? null : dt
}

export const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const dt = parseDateLocal(dateStr)
  if (!dt) return '—'
  return `${dt.getDate()} ${MESES[dt.getMonth()]} ${dt.getFullYear()}`
}

export const relDate = (dateStr) => {
  if (!dateStr) return ''
  const dt = parseDateLocal(dateStr)
  if (!dt) return ''
  const today = new Date()
  // Normalizar ambas a medianoche local para contar días de calendario
  const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.round((normalize(dt) - normalize(today)) / 86400000)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  if (diff === -1) return 'ayer'
  if (diff > 1) return `en ${diff} días`
  return `hace ${-diff} días`
}

export const fmtTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return dayjs(d).format('HH:mm a')
}

export const fmtMoney = (n) => {
  if (n === null || n === undefined || n === '') return '—'
  const num = Number(n)
  if (isNaN(num)) return '—'
  return num.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })
}
