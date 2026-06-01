import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const CAL_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const CAL_DOW = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function pad (n) {
  return String(n).padStart(2, '0')
}

export default function DatePickerIntecsa ({ value, onChange, error, min }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const base = value ? new Date(value + 'T12:00:00') : new Date()
    return { y: base.getFullYear(), m: base.getMonth() }
  })
  const ref = useRef(null)

  useEffect(() => {
    function onDoc (e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00')
      setView({ y: d.getFullYear(), m: d.getMonth() })
    }
  }, [value])

  const todayISO = (() => {
    const t = new Date()
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
  })()

  const firstDay = new Date(view.y, view.m, 1)
  let startDow = (firstDay.getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const iso = (d) => `${view.y}-${pad(view.m + 1)}-${pad(d)}`

  const shift = (delta) => {
    setView(v => {
      let m = v.m + delta, y = v.y
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { y, m }
    })
  }

  const fmtDisplay = (isoStr) => {
    if (!isoStr) return null
    const [y, m, d] = isoStr.split('-').map(Number)
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${d} ${months[m - 1]} ${y}`
  }

  return (
    <div className="date-picker-intecsa" ref={ref}>
      <button
        type="button"
        className={`date-picker-trigger${error ? ' error' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <Calendar size={16} />
        {value
          ? (
            <span>
              {fmtDisplay(value)}
              <span className="date-picker-rel">{value === todayISO ? '· hoy' : ''}</span>
            </span>
            )
          : <span className="date-picker-ph">dd / mm / aaaa</span>}
        <ChevronRight size={16} className="date-picker-chev" />
      </button>

      {open && (
        <div className="date-picker-pop">
          <div className="cal-head">
            <button type="button" onClick={() => shift(-1)}>
              <ChevronLeft size={15} />
            </button>
            <span className="cal-month-label">{CAL_MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={() => shift(1)}>
              <ChevronRight size={15} />
            </button>
          </div>
          <div className="cal-grid">
            {CAL_DOW.map(d => <div className="cal-dow" key={d}>{d}</div>)}
            {cells.map((d, i) => d == null
              ? <div key={i} />
              : (
                <button
                  type="button"
                  key={i}
                  className={`cal-day${iso(d) === value ? ' sel' : ''}${iso(d) === todayISO ? ' today' : ''}`}
                  onClick={() => { onChange(iso(d)); setOpen(false) }}
                >
                  {d}
                </button>
                )
            )}
          </div>
          <div className="cal-foot">
            <button type="button" onClick={() => { onChange(todayISO); setOpen(false) }}>Hoy</button>
            {value && (
              <button type="button" onClick={() => { onChange(''); setOpen(false) }}>Limpiar</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
