import { useEffect } from 'react'
import {
  X, FileText, Route, Package, Key, ExternalLink, Pencil, Ban,
  CheckCircle2, Circle, Calendar, Truck, User, MapPin, Hash,
  Fuel, FileCheck2, CreditCard, Receipt, Gauge, Info, Boxes,
  Mail, Activity, Tag, FileSpreadsheet, Wallet
} from 'lucide-react'
import { fmtDate, fmtTime, fmtMoney } from '../../utils/formatDate'
import EMPRESAS from '../../lib/empresas.json'
import { isDocCancelled } from '../../utils/getRowData'
import { computeCostBreakdown } from '../../utils/costBreakdown'

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
  return isDocCancelled(doc)
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

function CostLine ({ label, detail, total, bold, accent }) {
  return (
    <div className={`dd-costline${bold ? ' bold' : ''}${accent ? ' accent' : ''}`}>
      <div className="dd-costline-text">
        <span className="dd-costline-label">{label}</span>
        {detail && <span className="dd-costline-detail">{detail}</span>}
      </div>
      <div className="dd-costline-total tnum">{total}</div>
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

  // Cálculo centralizado del desglose (soporta cost_breakdown anidado y legacy plano).
  const breakdown = computeCostBreakdown(doc)
  const {
    concepts,
    subtotal: subtotalConceptos,
    profitPct,
    indirectPct,
    utilidad,
    indirectos,
    base,
    iva,
    total,
    hasCosts,
    hasBreakdown
  } = breakdown

  const {
    casetas: {
      rate: casetas_amount,
      unit: casetas_unit,
      days: casetas_days,
      notes: casetas_notes,
      importe: casetasImporte
    },
    operator: {
      rate: operator_rate,
      unit: operator_unit,
      days: operator_days,
      notes: operator_notes,
      importe: operatorImporte
    },
    perDiem: {
      rate: per_diem_rate,
      unit: per_diem_unit,
      days: per_diem_days,
      notes: per_diem_notes,
      importe: perDiemImporte
    },
    gasoline: {
      rate: gasoline_rate,
      unit: gasoline_unit,
      km: gasoline_km,
      notes: gasoline_notes,
      importe: gasolineImporte
    },
    unitRent: {
      rate: unit_rent_amount,
      unit: unit_rent_unit,
      qty: unit_rent_qty,
      period: unit_rent_period,
      notes: unit_rent_notes,
      importe: unitRentImporte
    }
  } = concepts

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
            <Section title="Desglose de conceptos" icon={CreditCard}>
              {casetasImporte > 0 && (
                <CostLine
                  label="Casetas"
                  detail={casetas_unit && casetas_unit !== 'fijo' ? `${fmtMoney(casetas_amount)} × ${casetas_days || 1} ${casetas_unit}` : 'Monto fijo'}
                  total={fmtMoney(casetasImporte)}
                />
              )}
              {operatorImporte > 0 && (
                <CostLine
                  label="Operador"
                  detail={`${operator_days || 0} días × ${fmtMoney(operator_rate)}/día`}
                  total={fmtMoney(operatorImporte)}
                />
              )}
              {perDiemImporte > 0 && (
                <CostLine
                  label="Viáticos"
                  detail={`${per_diem_days || 0} días × ${fmtMoney(per_diem_rate)}/día`}
                  total={fmtMoney(perDiemImporte)}
                />
              )}
              {gasolineImporte > 0 && (
                <CostLine
                  label="Gasolina"
                  detail="Monto fijo"
                  total={fmtMoney(gasolineImporte)}
                />
              )}
              {unitRentImporte > 0 && (
                <CostLine
                  label="Renta de unidad"
                  detail={unit_rent_qty > 1
                    ? `${fmtMoney(unit_rent_amount)} × ${unit_rent_qty} ${unit_rent_unit || 'días'}`
                    : (unit_rent_period
                        ? { dia: 'Por día', semana: 'Por semana', mes: 'Por mes' }[unit_rent_period] || 'Monto fijo'
                        : 'Monto fijo')}
                  total={fmtMoney(unitRentImporte)}
                />
              )}

              {subtotalConceptos > 0 && (
                <CostLine
                  label={hasBreakdown ? 'Subtotal conceptos' : 'Subtotal'}
                  total={fmtMoney(subtotalConceptos)}
                  bold
                />
              )}

              {utilidad > 0 && (
                <CostLine
                  label={`Utilidad ${profitPct || doc.profit_pct || 8}%`}
                  total={fmtMoney(utilidad)}
                />
              )}
              {indirectos > 0 && (
                <CostLine
                  label={`Indirectos ${indirectPct || doc.indirect_pct || 12}%`}
                  total={fmtMoney(indirectos)}
                />
              )}

              {base > 0 && subtotalConceptos > 0 && (
                <CostLine label="Subtotal + Util + Indir" total={fmtMoney(base)} bold />
              )}
              {iva > 0 && base > 0 && (
                <CostLine label="IVA 16%" total={fmtMoney(iva)} />
              )}
              {total > 0 && base > 0 && (
                <CostLine label="Total" total={fmtMoney(total)} bold accent />
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
