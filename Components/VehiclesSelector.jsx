import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export default function VehiclesSelector ({ vehicleSelected, listVehicles, setVehicleSelected }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function onDoc (e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selected = useMemo(() =>
    listVehicles.find(v => v.placas === vehicleSelected)
  , [vehicleSelected, listVehicles])

  const filtered = useMemo(() => {
    if (!q) return listVehicles
    const t = q.toLowerCase()
    return listVehicles.filter(v =>
      (v.placas + ' ' + v.modelo + ' ' + (v.tipo || '')).toLowerCase().includes(t)
    )
  }, [q, listVehicles])

  const avatarText = (text) => {
    const words = text?.split(' ') || []
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
    return (text?.slice(0, 2) || '??').toUpperCase()
  }

  return (
    <div className="vehicle-selector" ref={ref}>
      <button
        type="button"
        className="vehicle-trigger"
        onClick={() => { setOpen(o => !o); setQ('') }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {selected
            ? (
              <>
                <span className="vehicle-avatar">{avatarText(selected.modelo)}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.placas} — {selected.modelo}
                </span>
              </>
              )
            : <span className="vehicle-ph">Buscar unidad por nombre o placa…</span>}
        </span>
        <ChevronDown size={16} className="vehicle-chev" />
      </button>

      {open && (
        <div className="vehicle-pop">
          <div className="vehicle-search">
            <Search size={16} className="vehicle-search-icon" />
            <input
              autoFocus
              placeholder="Buscar…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {filtered.length === 0 && (
            <div className="vehicle-empty">Sin resultados</div>
          )}
          <div className="vehicle-list">
            {filtered.map(v => (
              <button
                key={v._id}
                type="button"
                className={`vehicle-opt${v.placas === vehicleSelected ? ' on' : ''}`}
                onClick={() => { setVehicleSelected(v.placas); setOpen(false) }}
              >
                <span className="vehicle-avatar">{avatarText(v.modelo)}</span>
                <span className="vehicle-info">
                  <span className="vehicle-name">{v.placas} — {v.modelo}</span>
                  <span className="vehicle-meta">{v.tipo || 'Vehículo'}</span>
                </span>
                {v.placas === vehicleSelected && <span className="vehicle-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
