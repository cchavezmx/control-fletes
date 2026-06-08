/* eslint-disable camelcase */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import {
  Plus, Download, Search, ChevronRight
} from 'lucide-react'
import PrevPDFModal from '../Components/Modal/PrevPDFModal'
import CancelModalDocument from '../Components/Modal/CancelModalDocument'
import DocDetailDrawer from '../Components/Expediente/DocDetailDrawer'
import getRowData from '../utils/getRowData'
import KpiStrip from '../Components/Expediente/KpiStrip'
import DocTable from '../Components/Expediente/DocTable'
import TableSkeleton from '../Components/Expediente/TableSkeleton'
import FloatingToolbar from '../Components/Expediente/FloatingToolbar'
import { EmptyState, NoResults } from '../Components/Expediente/EmptyState'

const validTypes = {
  Traslado: 'traslado',
  Flete: 'flete',
  Renta: 'renta'
}

function Empresa ({ empresa, documents, vehicles }) {
  const router = useRouter()
  const { empresaId } = router.query

  const rows = useMemo(() => getRowData({ documents }), [documents])

  const [selected, setSelected] = useState(new Set())
  const [gridKey, setGridKey] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'folio', dir: 'desc' })
  const [loading, setLoading] = useState(false)

  // pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // modals
  const [modalPreview, setModalPreview] = useState({ open: false, id: 0, type: 0 })
  const [cancelDoc, setCancelDoc] = useState(null)
  const [openCancel, setOpenCancel] = useState(false)
  const [detailDoc, setDetailDoc] = useState(null)

  const refreshData = () => {
    router.replace(empresaId)
  }

  // filtering
  const filteredRows = useMemo(() => {
    let r = rows.slice()
    if (typeFilter !== 'all') r = r.filter(d => d.type === typeFilter)
    // Solo se muestran los cancelados al elegir el KPI "Cancelados".
    // En cualquier otra vista (Todos/Activos) se ocultan.
    r = r.filter(d => statusFilter === 'cancelado' ? d.isCancel_status : !d.isCancel_status)
    if (query.trim()) {
      const t = query.toLowerCase()
      r = r.filter(d =>
        (d.folio + ' ' + d.subject + ' ' + d.bussiness_cost + ' ' + d.driver + ' ' + d.route + ' ' + d.vehicle).toLowerCase().includes(t)
      )
    }
    return r
  }, [rows, typeFilter, statusFilter, query])

  // sorting
  const sortedRows = useMemo(() => {
    if (!sort.key) return filteredRows
    const dir = sort.dir === 'asc' ? 1 : -1
    const keyMap = {
      folio: 'folio',
      tipo: 'type',
      asunto: 'subject',
      vehiculo: 'vehicle',
      fechaEntrega: 'delivery_date',
      estatus: 'isCancel_status'
    }
    const rowKey = keyMap[sort.key] || sort.key

    return [...filteredRows].sort((a, b) => {
      let va = a[rowKey]
      let vb = b[rowKey]

      if (sort.key === 'fechaEntrega') {
        const parseDate = (str) => {
          if (!str) return 0
          if (typeof str === 'string' && str.includes('/')) {
            const [d, m, y] = str.split('/')
            return new Date(`${y}-${m}-${d}`).getTime()
          }
          return new Date(str).getTime()
        }
        return (parseDate(va) - parseDate(vb)) * dir
      }

      if (sort.key === 'folio') {
        const na = parseInt(va) || 0
        const nb = parseInt(vb) || 0
        return (na - nb) * dir
      }

      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return (va === vb ? 0 : va ? 1 : -1) * dir
      }

      va = (va || '').toString().toLowerCase()
      vb = (vb || '').toString().toLowerCase()
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }, [filteredRows, sort])

  // pagination (must come after sortedRows is declared)
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [page, pageSize, sortedRows])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))

  const clear = useCallback(() => {
    setSelected(new Set())
    setGridKey(k => k + 1)
  }, [])

  // keyboard shortcuts
  useEffect(() => {
    function onKey (e) {
      if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clear])

  const onAction = useCallback((action, payload) => {
    switch (action) {
      case 'open': {
        setDetailDoc(payload)
        break
      }
      case 'pdf': {
        const doc = payload.id ? payload : payload
        setModalPreview({ open: true, id: doc.id || doc._id, type: doc.type })
        break
      }
      case 'edit': {
        const doc = payload.id ? payload : payload
        router.push({
          pathname: `/update/${doc.id || doc._id}`,
          query: { type: doc.type, currentEmpresa: empresa }
        })
        break
      }
      case 'cancel': {
        setCancelDoc(payload)
        setOpenCancel(true)
        break
      }
      case 'share': {
        const doc = payload
        const subject = encodeURIComponent(`Control de Fletes: ${doc.subject || doc.folio || 'Documento'}`)
        const body = encodeURIComponent(
          `Documento: ${doc.folio || ''}\nTipo: ${doc.type || ''}\nVehículo: ${doc.vehicle || ''}\n\nConsulta el PDF aquí:\nhttps://control-fletes.vercel.app/flotilla/${doc.id || doc._id}/${validTypes[doc.type] || 'traslado'}`
        )
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`
        window.open(gmailLink, '_blank')
        break
      }
      case 'share-bulk': {
        const ids = payload
        const docs = rows.filter(d => ids.includes(d.id))
        const links = docs.map(d => `• ${d.folio || ''} (${d.type}) → https://control-fletes.vercel.app/flotilla/${d.id}/${validTypes[d.type] || 'traslado'}`).join('\n')
        const subject = encodeURIComponent('Control de Fletes: Lote de documentos')
        const body = encodeURIComponent(`Documentos seleccionados:\n\n${links}`)
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`
        window.open(gmailLink, '_blank')
        break
      }
      case 'cancel-bulk': {
        toast.info('Selecciona un documento para cancelar individualmente')
        break
      }
      default:
        break
    }
  }, [router, empresa, rows])

  const handleToggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleAll = () => {
    const allSelected = sortedRows.length > 0 && sortedRows.every(r => selected.has(r.id))
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sortedRows.map(r => r.id)))
    }
  }

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }))
    setPage(1)
  }

  // Los chips de tipo cuentan según la vista de estatus activa (activos vs cancelados).
  const statusRows = rows.filter(d => statusFilter === 'cancelado' ? d.isCancel_status : !d.isCancel_status)

  const typeChips = [
    { v: 'all', label: 'Todos', count: statusRows.length },
    { v: 'Traslado', label: 'Traslados', count: statusRows.filter(d => d.type === 'Traslado').length },
    { v: 'Flete', label: 'Fletes', count: statusRows.filter(d => d.type === 'Flete').length },
    { v: 'Renta', label: 'Rentas', count: statusRows.filter(d => d.type === 'Renta').length }
  ]

  const dataState = rows.length === 0 ? 'empty' : 'ready'

  return (
    <div className="page" data-density="regular">
      {/* page head */}
      <div className="page-head">
        <div className="crumbs">
          <span className="cursor-pointer hover:text-[var(--brand-700)]" onClick={() => router.push('/')}>Organización</span>
          <ChevronRight size={13} className="text-[var(--muted-2)]" />
          <span className="cursor-pointer hover:text-[var(--brand-700)]" onClick={() => router.push('/')}>Empresas</span>
          <ChevronRight size={13} className="text-[var(--muted-2)]" />
          <span className="font-bold text-[var(--ink-2)]">{empresa}</span>
        </div>
        <div className="page-head-row">
          <div className="flex items-center gap-3">
            <div className="co-logo">{empresa?.slice(0, 2)?.toUpperCase() || 'IN'}</div>
            <div>
              <h1>{empresa}</h1>
              <div className="lede">
                Expediente operativo ·<span className="ml-1 font-semibold text-[var(--ink-2)]">{statusRows.length} documentos</span>
              </div>
            </div>
          </div>
          <div className="actions">
            <button
              className="btn-intecsa primary"
              onClick={() => router.push(`/documento/nuevo?empresaId=${empresaId}`)}
              type="button"
            >
              <Plus size={15} />
              Nuevo documento
            </button>
          </div>
        </div>
      </div>

      {dataState === 'empty' ? (
        <EmptyState onNew={() => router.push(`/documento/nuevo?empresaId=${empresaId}`)} />
      ) : (
        <>
          <KpiStrip
            docs={rows}
            statusFilter={statusFilter}
            onStatusFilter={(v) => { setStatusFilter(v); setPage(1) }}
          />

          {/* filters toolbar */}
          <div className="toolbar-intecsa">
            <div className="filters">
              {typeChips.map(c => (
                <button
                  key={c.v}
                  className={`chip-intecsa${typeFilter === c.v ? ' on' : ''}`}
                  onClick={() => { setTypeFilter(c.v); setPage(1) }}
                >
                  {c.label}
                  <span className="count tnum">{c.count}</span>
                </button>
              ))}
            </div>
            <div className="divider-v" />
            <div className="search-intecsa">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por folio, asunto, conductor…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              />
            </div>
            <div className="grow" />
          </div>

          {/* body */}
          {loading ? (
            <div className="table-wrap scroll">
              <TableSkeleton />
            </div>
          ) : filteredRows.length === 0 ? (
            <NoResults onClear={() => { setTypeFilter('all'); setStatusFilter('all'); setQuery(''); setPage(1) }} />
          ) : (
            <>
              <div className="table-wrap scroll">
                <DocTable
                  key={gridKey}
                  rows={paginatedRows}
                  selected={selected}
                  onToggle={handleToggle}
                  onToggleAll={handleToggleAll}
                  onOpen={(row) => {
                    onAction('open', row)
                  }}
                  onAction={onAction}
                  sort={sort}
                  onSort={handleSort}
                />
              </div>

              {/* Paginación */}
              <div className="page-footer">
                <div className="info">
                  <span>
                    Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                  </span>
                  <span style={{ color: 'var(--muted-2)' }}>
                    ({sortedRows.length} registros)
                  </span>
                </div>
                <div className="controls">
                  <select
                    className="select-intecsa"
                    style={{ width: 80, height: 34, fontSize: 13 }}
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                  >
                    {[10, 20, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    className="btn-intecsa sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    type="button"
                  >
                    Anterior
                  </button>
                  <button
                    className="btn-intecsa sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    type="button"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <FloatingToolbar
        selected={selected}
        docs={rows}
        onAction={onAction}
        onClear={clear}
      />

      {/* modals */}
      <DocDetailDrawer
        doc={detailDoc}
        open={!!detailDoc}
        onClose={() => setDetailDoc(null)}
        onOpenPDF={(d) => { setDetailDoc(null); onAction('pdf', d) }}
        onEdit={(d) => onAction('edit', d)}
        onCancel={(d) => { setDetailDoc(null); onAction('cancel', d) }}
      />

      {modalPreview.open && (
        <PrevPDFModal
          open={modalPreview.open}
          close={() => setModalPreview({ open: false })}
          modalPreview={modalPreview}
        />
      )}

      <CancelModalDocument
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        data={cancelDoc}
        refreshData={refreshData}
      />
    </div>
  )
}

export async function getServerSideProps (context) {
  const API = process.env.NEXT_PUBLIC_API
  const { empresaId, type } = context.query

  // Si no hay empresaId, redirigir al dashboard
  if (!empresaId) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const fetchDocs = (qType) =>
    fetch(`${API}/flotilla/documentos/${empresaId}${qType ? `?type=${qType}` : ''}`)
      .then((res) => res.json())
      .then(({ documents }) => documents[0])
      .catch(() => ({ traslado: [], fletes: [], rentas: [] }))

  // El endpoint solo devuelve activos por defecto y cancelados con type=cancel.
  // El expediente muestra ambos en una sola vista, así que traemos los dos y los unimos.
  const [active, cancelled] = await Promise.all([
    fetchDocs(type),
    fetchDocs('cancel')
  ])

  const mergeType = (key) => {
    const merged = [
      ...(Array.isArray(active?.[key]) ? active[key] : []),
      ...(Array.isArray(cancelled?.[key]) ? cancelled[key] : [])
    ]
    const seen = new Set()
    return merged.filter((d) => {
      if (seen.has(d._id)) return false
      seen.add(d._id)
      return true
    })
  }

  const documents = {
    name: active?.name || cancelled?.name,
    traslado: mergeType('traslado'),
    fletes: mergeType('fletes'),
    rentas: mergeType('rentas')
  }

  const vehicles = await fetch(`${API}/flotilla/vehicles`)
    .then((res) => res.json())
    .then(({ vehicles }) => vehicles.filter(({ is_active }) => is_active === true))
    .catch(() => [])

  return {
    props: {
      empresa: documents.name || 'Empresa',
      documents,
      vehicles
    }
  }
}

export default Empresa
