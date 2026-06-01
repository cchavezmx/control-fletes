import { useEffect } from 'react'
import {
  X, FileText, Route, Package, Key, ExternalLink, Pencil, Ban,
  CheckCircle2, Circle, Calendar, Truck, User, MapPin, Hash,
  Fuel, FileCheck2, CreditCard, Receipt, Gauge, Info, Boxes,
  Mail, Activity, Tag, FileSpreadsheet, Wallet
} from 'lucide-react'
import { fmtDate, fmtTime, fmtMoney } from '../../utils/formatDate'
import EMPRESAS from '../../lib/empresas.json'

const getEmpresaName = (id) => {
  if (!id) return null
  const idStr = typeof id === 'object' ? (id.$oid || id._id || '') : String(id)
  return EMPRESAS.find(e => e._id === idStr)?.name || idStr
}

const normalizeId = (v) => {
  if (!v) return null
  if (typeof v === 'string') return v
  if (typeof v === 'object') return v.$oid || v._id || null
  return String(v)
}

const TYPE_ICONS = { Traslado: Route, Flete: Package, Renta: Key }
const STATUS_LABELS = { activo: 'Activo', pendiente: 'Pendiente', cancelado: 'Cancelado', borrador: 'Borrador' }

function isCancelled (doc) {
  return doc?.isCancel_status && doc.isCancel_status !== false && doc.isCancel_status !== 'false'
}

function getStatusKey (doc) {
  if (isCancelled(doc)) return 'cancelado'
  return doc?.status || 'activo'
}

function Field ({ label, value, mono, full }) {
  const has = value !== null && value !== undefined && value !== ''
  return (
    <div className={`dd-field${full ? ' dd-field-full' : ''}`}>
      <div className="dd-label">{label}</div>
      <div className={`dd-value${mono ? ' mono' : ''}${has ? '' : ' empty'}`}>{has ? value : '—'}</div>
    </div>
  )
}

function Section ({ title, icon: Icon, children }) {
  return (
    <section className="dd-section">
      <header className="dd-section-head">
        {Icon && <Icon size={14} className="dd-section-ic" />}
        <h3>{title}</h3>
      </header>
      <div className="dd-grid">{children}</div>
    </section>
  )
}

function ConceptRow ({ label, rate, unit, days, qty, km, notes, period, total }) {
  const hasAny = rate || unit || days || qty || km || notes || period || total
  if (!hasAny) return null
  return (
    <div className="dd-concept">
      <div className="dd-concept-title">{label}</div>
      <div className="dd-concept-grid">
        {rate !== undefined && rate !== '' && <Field label="Tarifa" value={fmtMoney(rate)} />}
        {unit && <Field label="Unidad" value={unit} />}
        {(days !== undefined && days !== '') && <Field label="Días" value={days} />}
        {(qty !== undefined && qty !== '') && <Field label="Cantidad" value={qty} />}
        {(km !== undefined && km !== '') && <Field label="Kilómetros" value={km} />}
        {period && <Field label="Periodo" value={period} />}
        {notes && <Field label="Notas" value={notes} full />}
        {total !== undefined && total !== '' && <Field label="Importe" value={fmtMoney(total)} />}
      </div>
    </div>
  )
}

function ChecklistItem ({ ok, label }) {
  const Icon = ok ? CheckCircle2 : Circle
  return (
    <div className={`dd-check${ok ? ' on' : ' off'}`}>
      <Icon size={14} />
      <span>{label}</span>
    </div>
  )
}

export default function DocDetailDrawer ({ doc, open, onClose, onOpenPDF, onEdit, onCancel }) {
  useEffect(() => {
    if (!open) return
    function onKey (e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!doc) return null

  const TypeIcon = TYPE_ICONS[doc.type] || FileText
  const statusKey = getStatusKey(doc)
  const cancelled = isCancelled(doc)
  const pf = doc.pre_flight || {}
  const items = pf.items || {}
  const stops = Array.isArray(doc.stops) ? doc.stops : []
  const emailSent = Array.isArray(doc.email_sent) ? doc.email_sent : []

  // Cost breakdown: leer del subdocumento anidado (lo que persiste el backend),
  // con fallback a top-level para retrocompatibilidad con documentos legacy.
  const cb = doc.cost_breakdown || {}
  const casetas_amount  = cb.casetas_amount  ?? doc.casetas_amount
  const casetas_unit    = cb.casetas_unit    ?? doc.casetas_unit
  const casetas_days    = cb.casetas_days    ?? doc.casetas_days
  const casetas_notes   = cb.casetas_notes   ?? doc.casetas_notes
  const operator_rate   = cb.operator_rate   ?? doc.operator_rate
  const operator_unit   = cb.operator_unit   ?? doc.operator_unit
  const operator_days   = cb.operator_days   ?? doc.operator_days
  const operator_notes  = cb.operator_notes  ?? doc.operator_notes
  const per_diem_rate   = cb.per_diem_rate   ?? doc.per_diem_rate
  const per_diem_unit   = cb.per_diem_unit   ?? doc.per_diem_unit
  const per_diem_days   = cb.per_diem_days   ?? doc.per_diem_days
  const per_diem_notes  = cb.per_diem_notes  ?? doc.per_diem_notes
  const gasoline_rate   = cb.gasoline_rate   ?? doc.gasoline_rate
  const gasoline_unit   = cb.gasoline_unit   ?? doc.gasoline_unit
  const gasoline_km     = cb.gasoline_km     ?? doc.gasoline_days
  const gasoline_notes  = cb.gasoline_notes  ?? doc.gasoline_notes
  const unit_rent_amount = cb.unit_rent_amount ?? doc.unit_rent_amount
  const unit_rent_unit   = cb.unit_rent_unit   ?? doc.unit_rent_unit
  const unit_rent_qty    = cb.unit_rent_qty    ?? doc.unit_rent_qty
  const unit_rent_period = cb.unit_rent_period ?? doc.unit_rent_period
  const unit_rent_notes  = cb.unit_rent_notes  ?? doc.unit_rent_notes
  const profit_amount    = cb.profit_amount
  const indirect_amount  = cb.indirect_amount

  const hasCosts = casetas_amount || operator_rate || per_diem_rate ||
                   gasoline_rate || unit_rent_amount || doc.subtotal_travel

  const clientName  = getEmpresaName(normalizeId(doc.client))
  const companyName = getEmpresaName(normalizeId(doc.bussiness_cost))

  return (
    <>
      <div className={`scrim${open ? ' show' : ''}`} onClick={onClose} />
      <aside className={`sheet-right sheet-detail${open ? ' show' : ''}`} aria-hidden={!open}>
        <div className="sheet-head">
          <div className="sh-ic">
            <TypeIcon size={20} />
          </div>
          <div className="dd-head-text">
            <div className="sh-folio">
              {doc.type} <span className="dd-folio-num">#{doc.folio || '—'}</span>
            </div>
            <div className="sh-sub">{doc.subject || 'Sin asunto'}</div>
          </div>
          <div className="spacer" />
          <span className={`pill-intecsa type-${(doc.type || '').toLowerCase()}`}>
            <TypeIcon className="ic" size={13} />
            {doc.type}
          </span>
          <span className={`badge-intecsa ${statusKey}`}>
            <span className="dot" />
            {STATUS_LABELS[statusKey] || statusKey}
          </span>
          <button className="iconbtn-intecsa" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body">
          <Section title="Identidad" icon={Hash}>
            <Field label="Folio" value={doc.folio} mono />
            <Field label="ID interno" value={doc._id || doc.id} mono />
            <Field label="Tipo" value={doc.type} />
            <Field label="Estatus" value={STATUS_LABELS[statusKey] || statusKey} />
            <Field label="Creado" value={`${fmtDate(doc.createdAt)} ${fmtTime(doc.createdAt)}`} />
            <Field label="Actualizado" value={fmtDate(doc.updatedAt)} />
          </Section>

          <Section title="Cliente" icon={Receipt}>
            <Field label="Empresa creadora" value={companyName} />
            <Field label="Cliente destino" value={clientName} />
            <Field label="Centro de costos" value={doc.cost_center} />
            <Field label="Asunto" value={doc.subject} full />
            {doc.notes && <Field label="Notas" value={doc.notes} full />}
          </Section>

          <Section title="Fechas" icon={Calendar}>
            <Field label="Fecha de solicitud" value={fmtDate(doc.request_date)} />
            <Field label="Fecha de entrega" value={fmtDate(doc.delivery_date)} />
          </Section>

          <Section title="Vehículo" icon={Truck}>
            <Field label="Placas" value={doc.vehicle} mono />
            <Field label="Modelo" value={doc.modelo || doc.vehicle_info?.modelo} />
            {doc.description && (
              <>
                <Field label="Plan" value={doc.description.planName} />
                <Field label="Descripción del plan" value={doc.description.planDescription} full />
              </>
            )}
            {doc.vehicle_info && (
              <div className="dd-field dd-field-full">
                <div className="dd-label">Unidades asociadas al plan</div>
                {Array.isArray(doc.vehicle_info) ? (
                  doc.vehicle_info.length > 0 ? (
                    <div className="dd-vehicles">
                      {doc.vehicle_info.map((v, i) => (
                        <div key={v._id || i} className="dd-vehicle-row">
                          <span className="dd-vehicle-placa">{v.placas || '—'}</span>
                          <span className="dd-vehicle-modelo">{v.modelo || '—'}</span>
                          {v.expiration_card && <span className="dd-vehicle-meta">Tarjeta: {fmtDate(v.expiration_card)}</span>}
                          {v.expiration_verify && <span className="dd-vehicle-meta">Verificación: {fmtDate(v.expiration_verify)}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dd-value empty">Sin unidades asignadas</div>
                  )
                ) : (
                  <div className="dd-vehicles">
                    <div className="dd-vehicle-row">
                      <span className="dd-vehicle-placa">{doc.vehicle_info.placas || '—'}</span>
                      <span className="dd-vehicle-modelo">{doc.vehicle_info.modelo || '—'}</span>
                      {doc.vehicle_info.expiration_card && <span className="dd-vehicle-meta">Tarjeta: {fmtDate(doc.vehicle_info.expiration_card)}</span>}
                      {doc.vehicle_info.expiration_verify && <span className="dd-vehicle-meta">Verificación: {fmtDate(doc.vehicle_info.expiration_verify)}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section title="Conductor y ruta" icon={User}>
            <Field label="Conductor" value={doc.driver} />
            <Field label="Ruta" value={doc.route} full />
            <Field label="Origen" value={doc.origin} />
            <Field label="Destino" value={doc.destination} />
            {stops.length > 0 && (
              <div className="dd-field dd-field-full">
                <div className="dd-label">Paradas ({stops.length})</div>
                <div className="dd-chips">
                  {stops.map((s, i) => (
                    <span key={i} className="dd-chip"><MapPin size={11} />{s}</span>
                  ))}
                </div>
              </div>
            )}
            <Field label="Recorrido" value={doc.recorrido_km ? `${doc.recorrido_km} km` : null} />
            <Field label="Km salida" value={doc.kilometer_out} mono />
            <Field label="Km entrada" value={doc.kilometer_in} mono />
            <Field label="Total km" value={
              doc.kilometer_out !== undefined && doc.kilometer_in !== undefined
                ? `${Math.max(0, Number(doc.kilometer_in) - Number(doc.kilometer_out))} km`
                : null
            } />
            {doc.link_googlemaps && (
              <div className="dd-field dd-field-full">
                <div className="dd-label">Mapa</div>
                <a className="dd-link" href={doc.link_googlemaps} target="_blank" rel="noreferrer">
                  <ExternalLink size={12} /> Abrir en Google Maps
                </a>
              </div>
            )}
          </Section>

          <Section title="Carga y combustible" icon={Boxes}>
            <Field label="Descripción de carga" value={doc.cargo_description} full />
            {doc.fuel_level !== undefined && doc.fuel_level !== '' && (
              <div className="dd-field dd-field-full">
                <div className="dd-label">Nivel de combustible</div>
                <div className="dd-fuel">
                  <div className="dd-fuel-bar"><div className="dd-fuel-fill" style={{ width: `${Math.min(100, Math.max(0, Number(doc.fuel_level) || 0))}%` }} /></div>
                  <span className="dd-fuel-num">{doc.fuel_level}%</span>
                </div>
              </div>
            )}
          </Section>

          {hasCosts && (
            <Section title="Costos" icon={CreditCard}>
              <ConceptRow label="Casetas" rate={casetas_amount} unit={casetas_unit} days={casetas_days} notes={casetas_notes} />
              <ConceptRow label="Operador" rate={operator_rate} unit={operator_unit} days={operator_days} notes={operator_notes} />
              <ConceptRow label="Viáticos" rate={per_diem_rate} unit={per_diem_unit} days={per_diem_days} notes={per_diem_notes} />
              <ConceptRow label="Combustible" rate={gasoline_rate} unit={gasoline_unit} km={gasoline_km} notes={gasoline_notes} />
              <ConceptRow label="Renta de unidad" rate={unit_rent_amount} unit={unit_rent_unit} qty={unit_rent_qty} period={unit_rent_period} notes={unit_rent_notes} />
              <Field label="Subtotal conceptos" value={fmtMoney(doc.subtotal_travel)} />
              {doc.profit_pct !== undefined && doc.profit_pct !== '' && (
                <Field
                  label="Utilidad"
                  value={`${doc.profit_pct}%${profit_amount !== undefined && profit_amount !== '' ? ` · ${fmtMoney(profit_amount)}` : ''}`}
                />
              )}
              {doc.indirect_pct !== undefined && doc.indirect_pct !== '' && (
                <Field
                  label="Indirectos"
                  value={`${doc.indirect_pct}%${indirect_amount !== undefined && indirect_amount !== '' ? ` · ${fmtMoney(indirect_amount)}` : ''}`}
                />
              )}
              {doc.priority && <Field label="Prioridad" value={doc.priority} />}
            </Section>
          )}

          {doc.tarjeta_deposito && (
            <Section title="Pago" icon={Wallet}>
              <Field label="Tarjeta / forma de pago" value={doc.tarjeta_deposito} full />
            </Section>
          )}

          {Object.keys(items).length > 0 && (
            <Section title="Revisión de unidad" icon={FileCheck2}>
              <div className="dd-field dd-field-full">
                <div className="dd-label">Checklist pre-vuelo</div>
                <div className="dd-checks">
                  <ChecklistItem ok={!!(items.extintor ?? doc.checklist_extintor)} label="Extintor" />
                  <ChecklistItem ok={!!(items.llanta_refaccion ?? doc.checklist_llanta_refaccion)} label="Llanta de refacción" />
                  <ChecklistItem ok={!!(items.herramientas ?? doc.checklist_herramientas)} label="Herramientas" />
                  <ChecklistItem ok={!!(items.gato ?? doc.checklist_gato)} label="Gato" />
                  <ChecklistItem ok={!!(items.cinturon ?? doc.checklist_cinturon)} label="Cinturón" />
                  <ChecklistItem ok={!!(items.documentos ?? doc.checklist_documentos)} label="Documentos" />
                  <ChecklistItem ok={!!(items.tarjetas ?? doc.checklist_tarjetas)} label="Tarjetas" />
                </div>
                {(pf.observaciones || doc.checklist_observaciones) && (
                  <div className="dd-obs">{pf.observaciones || doc.checklist_observaciones}</div>
                )}
              </div>
            </Section>
          )}

          {(doc.document_id || doc.project_id || doc.fuel_card || doc.fuel_amount) && (
            <Section title="CFDI y combustible" icon={FileSpreadsheet}>
              {doc.document_id && <Field label="Folio fiscal (UUID)" value={doc.document_id} mono full />}
              {doc.project_id && <Field label="Proyecto" value={doc.project_id} />}
              {doc.fuel_card && <Field label="Tarjeta de combustible" value={doc.fuel_card} mono />}
              {doc.fuel_amount && <Field label="Carga de combustible" value={doc.fuel_amount} full />}
            </Section>
          )}

          {(emailSent.length > 0 || doc.is_active !== undefined) && (
            <Section title="Auditoría" icon={Activity}>
              {doc.is_active !== undefined && (
                <Field
                  label="Documento activo"
                  value={doc.is_active ? 'Sí' : 'No'}
                />
              )}
              {emailSent.length > 0 && (
                <div className="dd-field dd-field-full">
                  <div className="dd-label"><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Emails enviados ({emailSent.length})</div>
                  <div className="dd-chips">
                    {emailSent.map((e, i) => {
                      const addr = typeof e === 'string' ? e : (e?.to || e?.email || JSON.stringify(e))
                      const when = typeof e === 'object' ? (e.sent_at || e.date) : null
                      return (
                        <span key={i} className="dd-chip" title={when ? `Enviado: ${fmtDate(when)} ${fmtTime(when)}` : undefined}>
                          {addr}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </Section>
          )}

          {cancelled && (
            <section className="dd-section dd-cancel">
              <header className="dd-section-head">
                <Ban size={14} className="dd-section-ic" />
                <h3>Documento cancelado</h3>
              </header>
              <div className="dd-cancel-reason">
                <Info size={14} />
                <span>{doc.isCancel_status}</span>
              </div>
            </section>
          )}

          <div className="dd-foot">
            <button
              className="btn-intecsa primary"
              onClick={() => onOpenPDF && onOpenPDF(doc)}
              type="button"
            >
              <FileText size={15} /> Ver PDF
            </button>
            <button
              className="btn-intecsa"
              onClick={() => onEdit && onEdit(doc)}
              disabled={cancelled}
              type="button"
            >
              <Pencil size={15} /> Editar
            </button>
            <button
              className="btn-intecsa danger"
              onClick={() => onCancel && onCancel(doc)}
              disabled={cancelled}
              type="button"
            >
              <Ban size={15} /> {cancelled ? 'Ya cancelado' : 'Cancelar documento'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
