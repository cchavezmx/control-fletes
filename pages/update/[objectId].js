import { useState } from 'react'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import {
  ArrowLeft, FileText, MapPin, CalendarDays, Receipt, Fuel, CreditCard, Save
} from 'lucide-react'
import EMPRESAS from '../../lib/empresas.json'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

const API = process.env.NEXT_PUBLIC_API

/* ─── Helpers de presentación ─── */
const Section = ({ title, icon: Icon, children }) => (
  <section className="edit-section">
    <header className="edit-section-head">
      {Icon && <Icon size={16} />}
      <h3>{title}</h3>
    </header>
    <div className="form-row">{children}</div>
  </section>
)

const Field = ({ label, children, hint, full }) => (
  <div className="form-group" style={full ? { gridColumn: '1 / -1' } : undefined}>
    <label className="label-intecsa">{label}</label>
    {children}
    {hint && <p className="help-text">{hint}</p>}
  </div>
)

const UpdateModel = ({ type, objectId, currentModel, currentEmpresa, empresaId }) => {
  const router = useRouter()

  // bussiness_cost a veces llega como objeto poblado desde el backend; normalizar a id string.
  const bcId = typeof currentModel?.bussiness_cost === 'object'
    ? currentModel?.bussiness_cost?._id
    : currentModel?.bussiness_cost
  const backEmpresaId = empresaId || bcId || ''

  const fmtDay = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '')

  const { register, handleSubmit } = useForm({
    defaultValues: {
      ...currentModel,
      request_date: fmtDay(currentModel?.request_date),
      delivery_date: fmtDay(currentModel?.delivery_date)
    }
  })

  const [saveData, setSaveData] = useState(false)

  const goBack = () => router.push(`/${backEmpresaId}`)

  const updateOrderSubmit = async (data) => {
    setSaveData(true)
    try {
      const res = await fetch(`${API}/flotilla/update/${objectId}?type=${type.toLowerCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`Error ${res.status}: ${errText || res.statusText}`)
      }

      const result = await res.json().catch(() => ({}))

      if (result?.message?._id) {
        toast.success('Documento actualizado')
        setTimeout(goBack, 1200)
      } else {
        toast.error(typeof result?.message === 'string' ? result.message : 'No se pudo actualizar')
      }
    } catch (err) {
      toast.error(err.message || 'No se pudo actualizar')
    } finally {
      setSaveData(false)
    }
  }

  /* ─── Estado: documento no disponible ─── */
  if (!currentModel) {
    return (
      <div className="wizard-wrap">
        <div className="edit-empty">
          <div className="edit-empty-ic"><FileText size={28} /></div>
          <h1>No se pudo cargar el documento</h1>
          <p>El documento no existe o el servicio no respondió. Verifica el enlace o inténtalo de nuevo.</p>
          <button className="btn-intecsa" type="button" onClick={() => router.back()}>
            <ArrowLeft size={15} /> Regresar
          </button>
        </div>
      </div>
    )
  }

  const inputCls = 'input-intecsa'

  return (
    <div className="wizard-wrap">
      {/* Header */}
      <div className="wizard-header">
        <div className="wizard-header-left">
          <button className="iconbtn-intecsa" type="button" onClick={goBack} title="Volver">
            <ArrowLeft size={16} />
          </button>
          <h1 className="wizard-header-title">Editar documento</h1>
          <span className="badge-type">{type}</span>
          <span className="badge-folio">Folio {currentModel.folio}</span>
        </div>
      </div>

      <div className="edit-subhead">
        <p className="edit-empresa">{currentEmpresa}</p>
        <p className="help-text">El tipo de documento y el folio no se pueden actualizar.</p>
      </div>

      <form onSubmit={handleSubmit(updateOrderSubmit)} className="edit-form">
        <Section title="Información general" icon={FileText}>
          <Field label="Asunto del documento" full>
            <input className={inputCls} placeholder="Ej. Traslado de personal" {...register('subject')} />
          </Field>
          <Field label="Conductor">
            <input className={inputCls} placeholder="Nombre del conductor" {...register('driver')} />
          </Field>
          <Field label="Cliente destino" full>
            <select className="select-intecsa" {...register('client', { required: true })}>
              {EMPRESAS.map(empresa => (
                <option key={empresa._id} value={empresa._id}>{empresa.name}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Ruta" icon={MapPin}>
          <Field label="Ruta" full>
            <input className={inputCls} placeholder="Origen → paradas → destino" {...register('route')} />
          </Field>
          <Field label="Recorrido (km)">
            <input className={inputCls} type="number" placeholder="0" {...register('recorrido_km')} />
          </Field>
          <Field label="Link de Google Maps">
            <input className={inputCls} placeholder="https://maps.google.com/..." {...register('link_googlemaps')} />
          </Field>
        </Section>

        <Section title="Fechas" icon={CalendarDays}>
          <Field label="Fecha de solicitud">
            <input className={inputCls} type="date" {...register('request_date', { required: true })} />
          </Field>
          <Field label="Fecha de entrega">
            <input className={inputCls} type="date" {...register('delivery_date', { required: true })} />
          </Field>
        </Section>

        <Section title="Facturación" icon={Receipt}>
          <Field label={`Subtotal ${type}`}>
            <input className={inputCls} type="number" placeholder="0.00" {...register('subtotal_travel')} />
          </Field>
          <Field label="Salida de almacén (ADMIN/COMERCIAL)">
            <input className={inputCls} placeholder="Folio / referencia" {...register('document_id')} />
          </Field>
          <Field label="Folio proyecto">
            <input className={inputCls} placeholder="Folio del proyecto" {...register('project_id')} />
          </Field>
        </Section>

        <Section title="Combustible" icon={Fuel}>
          <Field label="Nivel de combustible (%)">
            <input className={inputCls} type="number" placeholder="0" {...register('fuel_level')} />
          </Field>
          <Field label="Número de tarjeta de combustible">
            <input className={inputCls} placeholder="•••• 0000" {...register('fuel_card')} />
          </Field>
          <Field label="Carga de combustible">
            <input className={inputCls} placeholder="Monto / litros" {...register('fuel_amount')} />
          </Field>
        </Section>

        {currentModel.casetas && (
          <Section title="Casetas" icon={CreditCard}>
            <Field label="Costo total">
              <input className={inputCls} placeholder="0.00" {...register('casetas')} />
            </Field>
            <Field label="Tarjeta / banco / nombre">
              <input className={inputCls} placeholder="TARJETA / BANCO / NOMBRE" {...register('tarjeta_deposito')} />
            </Field>
          </Section>
        )}

        <div className="edit-foot">
          <button className="btn-intecsa" type="button" onClick={goBack} disabled={saveData}>
            <ArrowLeft size={15} /> Regresar
          </button>
          <button className="btn-intecsa primary" type="submit" disabled={saveData}>
            <Save size={15} /> {saveData ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export async function getServerSideProps (context) {
  const { type, currentEmpresa, empresaId } = context.query
  const { objectId } = context.params

  if (!type) return { notFound: true }

  const lowerType = type.toLowerCase()

  // 1) Intento directo por id. (El backend /flotilla/get/:id puede responder 400.)
  let currentModel = await fetch(`${API}/flotilla/get/${objectId}?type=${lowerType}`)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (!data) return null
      // Backend puede responder { traslado: {...} }, { Traslado: {...} } o el doc directo
      return data[lowerType] ?? data[type] ?? data.document ?? (data._id ? data : null)
    })
    .catch(() => null)

  // 2) Fallback: tomar el documento del listado de la empresa (endpoint que sí funciona).
  if (!currentModel && empresaId) {
    currentModel = await fetch(`${API}/flotilla/documentos/${empresaId}?type=${lowerType}`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        const bucket = json?.documents?.[0]
        if (!bucket) return null
        const all = [
          ...(bucket.traslado || []),
          ...(bucket.fletes || []),
          ...(bucket.rentas || [])
        ]
        return all.find(d => d._id === objectId) || null
      })
      .catch(() => null)
  }

  return {
    props: {
      type,
      objectId,
      empresaId: empresaId ?? null,
      currentEmpresa: currentEmpresa ?? '',
      currentModel: currentModel ?? null
    }
  }
}

export default UpdateModel
