import dayjs from 'dayjs'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    const dt = new Date(`${y}-${m}-${d}`)
    if (!isNaN(dt)) return `${dt.getDate()} ${MESES[dt.getMonth()]} ${dt.getFullYear()}`
  }
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export const relDate = (dateStr) => {
  if (!dateStr) return ''
  let dt
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    dt = new Date(`${y}-${m}-${d}`)
  } else {
    dt = new Date(dateStr)
  }
  if (isNaN(dt)) return ''
  const today = new Date()
  const diff = Math.round((dt - today) / 86400000)
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
