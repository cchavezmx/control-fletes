import { CheckCircle, Clock, Ban, Inbox, TrendingUp } from 'lucide-react'

export default function KpiStrip ({ docs, statusFilter, onStatusFilter }) {
  const counts = {
    activo: docs.filter(d => !d.isCancel_status).length,
    cancelado: docs.filter(d => d.isCancel_status).length,
    total: docs.length
  }

  const cards = [
    { key: 'activo', cls: 'k-act', label: 'Activos', val: counts.activo, ic: CheckCircle,
      foot: (
        <>
          <span className="up"><TrendingUp className="inline h-3 w-3" /></span>
          <span>Operativos</span>
        </>
      ) },
   { key: 'cancelado', cls: 'k-canc', label: 'Cancelados', val: counts.cancelado, ic: Ban,
      foot: 'Últimos 30 días' },
  ]

  return (
    <div className="kpis">
      {cards.map(c => (
        <div
          key={c.key}
          className={`kpi ${c.cls} ${statusFilter === c.key ? 'on' : ''}`}
          onClick={() => onStatusFilter(statusFilter === c.key ? 'all' : c.key)}
        >
          <div className="kpi-top">
            <span className="kpi-label">{c.label}</span>
            <span className="kpi-ic"><c.ic className="h-4 w-4" /></span>
          </div>
          <div className="kpi-val tnum">{c.val}</div>
          <div className="kpi-foot">{c.foot}</div>
        </div>
      ))}
    </div>
  )
}
