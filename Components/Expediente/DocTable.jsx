import { useMemo } from 'react'
import { ChevronUp, ChevronDown, Route, Package, Key } from 'lucide-react'
import RowMenu from './RowMenu'
import { fmtDate, relDate } from '../../utils/formatDate'

function TypePill ({ tipo }) {
  const iconMap = { Traslado: Route, Flete: Package, Renta: Key }
  const Icon = iconMap[tipo] || Package
  return (
    <span className={`pill-intecsa type-${tipo.toLowerCase()}`}>
      <Icon className="ic" size={13} />
      {tipo}
    </span>
  )
}

function StatusBadge ({ estatus }) {
  const labels = { activo: 'Activo', pendiente: 'Pendiente', cancelado: 'Cancelado', borrador: 'Borrador' }
  return (
    <span className={`badge-intecsa ${estatus}`}>
      <span className="dot" />
      {labels[estatus] || estatus}
    </span>
  )
}

const COLS = [
  { key: 'folio', label: 'Folio' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'asunto', label: 'Asunto' },
  { key: 'vehiculo', label: 'Vehículo' },
  { key: 'fechaEntrega', label: 'Entrega' },
  { key: 'estatus', label: 'Estatus' },
]

function Checkbox ({ checked, indeterminate, onChange }) {
  return (
    <div
      className={`chk${checked ? ' on' : ''}${indeterminate && !checked ? ' indet' : ''}`}
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(!checked) }}
    >
      {!indeterminate && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </div>
  )
}

export default function DocTable ({ rows, selected, onToggle, onToggleAll, onOpen, onAction, sort, onSort }) {
  const allSel = rows.length > 0 && rows.every(r => selected.has(r.id))
  const someSel = rows.some(r => selected.has(r.id))

  return (
    <table className="dtable">
      <thead>
        <tr>
          <th className="col-check">
            <Checkbox checked={allSel} indeterminate={someSel && !allSel} onChange={onToggleAll} />
          </th>
          {COLS.map(c => (
            <th key={c.key} className={sort.key === c.key ? 'sorted' : ''} onClick={() => onSort(c.key)}>
              <span className="th-in">
                {c.label}
                {sort.key === c.key ? (
                  sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                ) : (
                  <ChevronUp size={13} className="opacity-30" />
                )}
              </span>
            </th>
          ))}
          <th className="col-actions" />
        </tr>
      </thead>
      <tbody>
        {rows.map(d => {
          const sel = selected.has(d.id)
          const estatus = d.isCancel_status ? 'cancelado' : 'activo'
          return (
            <tr
              key={d.id}
              className={`${sel ? 'sel ' : ''}${estatus === 'cancelado' ? 'cancel-row' : ''}`}
              onClick={() => onOpen(d)}
            >
              <td className="col-check" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={sel} onChange={() => onToggle(d.id)} />
              </td>
              <td><span className="folio tnum">{d.folio}</span></td>
              <td><TypePill tipo={d.type} /></td>
              <td>
                <div className="asunto">{d.subject}</div>
                <div className="asunto"><span className="sub">{d.bussiness_cost}</span></div>
              </td>
              <td>
                <span className="veh">
                  <span className="plate tnum">{d.vehicle || d.modelo || '—'}</span>
                  <span className="text-[13px] text-[var(--muted)]">{d.modelo || ''}</span>
                </span>
              </td>
              <td className="fecha tnum">
                {fmtDate(d.delivery_date || d.request_date)}
                <span className="rel">{relDate(d.delivery_date || d.request_date)}</span>
              </td>
              <td><StatusBadge estatus={estatus} /></td>
              <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                <RowMenu doc={d} onAction={onAction} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
