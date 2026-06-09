/* eslint-disable react-hooks/exhaustive-deps */

import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, X, Share2, Box, TrendingUp, Link2,
  Truck, Users, MapPin, Receipt, Plus
} from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Controller, FormProvider, useWatch } from 'react-hook-form'
import NewVehicle from '../Modal/NewVehicle'
import NewPlan from '../Modal/NewPlan'
import RentaConceptsBreakdown from '../Modal/RentaConceptsBreakdown'
import FuelLevelSlider from '../Modal/FuelLevelSlider'
import useDocumentWizard, { STEPS } from '../../hooks/useDocumentWizard'
import EMPRESAS from '../../lib/empresas.json'
import VehiclesSelector from '../VehiclesSelector'
import DatePickerIntecsa from '../DatePickerIntecsa'
import Banner from '../Banner'

export { DOCUMENT_SCHEMA, STEPS } from '../../hooks/useDocumentWizard'

const TYPE_CARDS = [
  { id: 'traslado', name: 'Traslado', desc: 'Mover una unidad propia sin carga comercial', icon: Share2 },
  { id: 'flete', name: 'Flete', desc: 'Transporte de carga para un cliente', icon: Box },
  { id: 'renta', name: 'Renta', desc: 'Arrendamiento de unidad con o sin operador', icon: TrendingUp }
]

const STEP_DESCRIPTIONS = [
  'Define qué documento estás creando y con qué unidad se opera. El folio se asigna automáticamente.',
  'Para quién es el documento y las ventanas de tiempo de la operación.',
  'Quién conduce, por dónde y cuánto recorre.',
  'Nivel de combustible, carga y revisión visual de la unidad (extintor, refacciones, documentos).',
  'Montos de la operación. Los campos marcados aplican según el tipo de documento.',
  'Revisa los datos antes de guardar el documento.'
]

export default function DocumentWizard (props) {
  const {
    empresaId,
    listVehicles = [],
    onCancel,
    onSaved
  } = props

  const {
    methods,
    register,
    control,
    setValue,
    watch,
    errors,
    activeStep,
    type,
    setType,
    vehicleSelected,
    setVehicleSelected,
    planByVehicle,
    setPlanByVehicle,
    loadingPlans,
    getIdVehicle,
    stepErrors,
    saveData,
    handleNext,
    handleBack,
    goToStep,
    handleCancel,
    submit,
    typeBadgeLabel,
    folioLabel,
    panelRef
  } = useDocumentWizard({ empresaId, listVehicles, onCancel, onSaved })

  const [openNewVehicle, setOpenNewVehicle] = useState(false)
  const [newPlan, setNewPlan] = useState(false)
  const planWatchSelected = useWatch({ control, name: 'plan' })

  const handledNewVehicle = (event) => setOpenNewVehicle(event)
  const handledNewPlan = (event) => setNewPlan(event)

  const StepTipoVehiculo = () => (
    <div className="wizard-step-body">
      <div className="form-group">
        <label className="label-intecsa">
          Tipo de documento
          <span className="required-mark">*</span>
        </label>
        <div className="wizard-type-cards">
          {TYPE_CARDS.map((card) => {
            const Icon = card.icon
            const selected = type === card.id
            return (
              <div
                key={card.id}
                className={`wizard-type-card${selected ? ' selected' : ''}`}
                onClick={() => setType(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setType(card.id)
                }}
              >
                <span className="type-check"><Check size={14} /></span>
                <span className="type-icon"><Icon size={20} /></span>
                <p className="type-name">{card.name}</p>
                <p className="type-desc">{card.desc}</p>
              </div>
            )
          })}
        </div>
        {!type && <span className="field-error">Selecciona un tipo de documento</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="label-intecsa">
            Vehículo
            <span className="required-mark">*</span>
          </label>
          <VehiclesSelector
            vehicleSelected={vehicleSelected}
            setVehicleSelected={setVehicleSelected}
            listVehicles={listVehicles}
          />
          {!vehicleSelected && <span className="field-error">Selecciona un vehículo</span>}
          <p className="help-text">Lista de la flota disponible de Intecsa.</p>
        </div>

        {vehicleSelected && (
          <div className="form-group">
            <label className="label-intecsa">
              Plan del vehículo <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
            </label>
            {loadingPlans ? (
              <div className="skel" style={{ height: 40, borderRadius: 8 }} />
            ) : (
              <select
                className={`select-intecsa ${errors.plan ? 'error' : ''}`}
                value={planWatchSelected || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    handledNewPlan(true)
                    return
                  }
                  setValue('plan', e.target.value, { shouldValidate: true })
                }}
              >
                <option value="">Selecciona un plan…</option>
                {planByVehicle?.length > 0
                  ? planByVehicle.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName}
                    </option>
                  ))
                  : <option value="" disabled>No hay planes para este vehículo</option>}
                <option value="__new__">+ Crear nuevo plan</option>
              </select>
            )}
            {errors.plan && <span className="field-error">{errors.plan.message}</span>}
            <p className="help-text">Configuración de carga asociada.</p>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="label-intecsa">Folio consecutivo</label>
          <div className="consecutivo-box">
            <span className="consecutivo-val">{folioLabel}</span>
            <span className="badge-folio" style={{ fontSize: '12px' }}>auto</span>
          </div>
        </div>
      </div>
    </div>
  )

  const StepClienteFechas = () => (
    <div className="wizard-step-body">
      <div className="form-row">
        <div className="form-group">
          <label className="label-intecsa">
            Cliente destino
            <span className="required-mark">*</span>
          </label>
          <select
            className={`select-intecsa ${errors.client ? 'error' : ''}`}
            value={watch('client') || ''}
            onChange={(e) => setValue('client', e.target.value, { shouldValidate: true })}
          >
            <option value="">Selecciona un cliente…</option>
            {
              type === 'traslado'
                ? EMPRESAS.filter(e => e._id === empresaId).map(e => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))
                : EMPRESAS.filter(e => e._id !== empresaId).map(e => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))
            }
          </select>
          {errors.client && <span className="field-error">{errors.client.message}</span>}
        </div>

        <div className="form-group">
          <label className="label-intecsa">
            Asunto
            <span className="required-mark">*</span>
          </label>
          <input
            className={`input-intecsa ${errors.subject ? 'error' : ''}`}
            placeholder="Ej. Traslado de material a obra Norte"
            {...register('subject')}
          />
          {errors.subject && <span className="field-error">{errors.subject.message}</span>}
          <p className="help-text">Una línea que describa la operación.</p>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="label-intecsa">
            Centro de costos <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
          </label>
          <select className="select-intecsa" {...register('cost_center')}>
            <option value="">Selecciona…</option>
            <option value="logistica">Logística</option>
            <option value="operaciones">Operaciones</option>
            <option value="comercial">Comercial</option>
            <option value="administracion">Administración</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label-intecsa">
            Fecha de solicitud
            <span className="required-mark">*</span>
          </label>
          <Controller
            name="request_date"
            control={control}
            render={({ field }) => (
              <DatePickerIntecsa
                value={field.value}
                onChange={field.onChange}
                error={errors.request_date}
              />
            )}
          />
          {errors.request_date && <span className="field-error">{errors.request_date.message}</span>}
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: 'calc(50% - 8px)' }}>
        <label className="label-intecsa">
          Fecha de entrega
          <span className="required-mark">*</span>
        </label>
        <Controller
          name="delivery_date"
          control={control}
          render={({ field }) => (
            <DatePickerIntecsa
              value={field.value}
              onChange={field.onChange}
              error={errors.delivery_date}
            />
          )}
        />
        {errors.delivery_date && <span className="field-error">{errors.delivery_date.message}</span>}
      </div>
    </div>
  )

  const StopsField = () => {
    const stops = useWatch({ control, name: 'stops' }) || []
    const stopsValue = Array.isArray(stops) ? stops : []

    const addStop = () => {
      const next = [...stopsValue, '']
      setValue('stops', next, { shouldValidate: false })
    }

    const removeStop = (idx) => {
      const next = stopsValue.filter((_, i) => i !== idx)
      setValue('stops', next, { shouldValidate: false })
    }

    const setStop = (idx, value) => {
      const next = [...stopsValue]
      next[idx] = value
      setValue('stops', next, { shouldValidate: false })
    }

    return (
      <div className="route-stops">
        {stopsValue.map((stop, idx) => (
          <div key={idx} className="route-stop-row">
            <input
              className="input-intecsa"
              placeholder={`Parada ${idx + 1} (dirección completa)`}
              value={stop || ''}
              onChange={(e) => setStop(idx, e.target.value)}
            />
            <button
              type="button"
              className="iconbtn-intecsa route-stop-remove"
              onClick={() => removeStop(idx)}
              title="Quitar parada"
            >
              <X size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="route-add-stop"
          onClick={addStop}
        >
          <Plus size={14} />
          Agregar parada
        </button>
      </div>
    )
  }

  const StepOperativos = () => (
    <div className="wizard-step-body">
      <div className="flex flex-col gap-4">
        <div className="form-group">
          <label className="label-intecsa">
            Conductor
            <span className="required-mark">*</span>
          </label>
          <input
            className={`input-intecsa ${errors.driver ? 'error' : 'w-full'}`}
            placeholder="Nombre completo del conductor"
            {...register('driver')}
          />
          {errors.driver && <span className="field-error">{errors.driver.message}</span>}
        </div>
      </div>

      <div className="route-flow">
        <div className="route-point">
          <div className="route-marker origin">
            <span className="route-marker-dot" />
          </div>
          <div className="route-point-body">
            <label className="label-intecsa">
              Origen
              <span className="required-mark">*</span>
            </label>
            <input
              className={`input-intecsa ${errors.origin ? 'error' : ''}`}
              placeholder="Ej. Monterrey, NL — dirección completa"
              {...register('origin')}
            />
            {errors.origin && <span className="field-error">{errors.origin.message}</span>}
          </div>
        </div>

        <StopsField />

        <div className="route-point">
          <div className="route-marker destination">
            <MapPin size={14} />
          </div>
          <div className="route-point-body">
            <label className="label-intecsa">
              Destino
              <span className="required-mark">*</span>
            </label>
            <input
              className={`input-intecsa ${errors.destination ? 'error' : ''}`}
              placeholder="Ej. Saltillo, Coah. — dirección completa"
              {...register('destination')}
            />
            {errors.destination && <span className="field-error">{errors.destination.message}</span>}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="label-intecsa">Recorrido</label>
          <div style={{ position: 'relative' }}>
            <input className="input-intecsa" placeholder="0" type="number" {...register('recorrido_km')} />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: 'var(--muted-2)' }}>km</span>
          </div>
          <p className="help-text">Se autocompleta desde la ruta; puedes ajustarlo.</p>
        </div>
        <div className="form-group">
          <label className="label-intecsa">
            KM de salida (odómetro) <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input className="input-intecsa" placeholder="0" type="number" {...register('kilometer_out')} />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: 'var(--muted-2)' }}>km</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="label-intecsa">
          Link de Google Maps <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
        </label>
        <div style={{ position: 'relative' }}>
          <Link2 className="h-4 w-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', width: 16, height: 16 }} />
          <input
            className="input-intecsa"
            style={{ paddingLeft: 38 }}
            placeholder="https://maps.google.com/..."
            {...register('link_googlemaps')}
          />
        </div>
        <p className="help-text">Pega la URL de la ruta planeada.</p>
      </div>
    </div>
  )

  const StepRevisionUnidad = () => {
    const fuelLevel = useWatch({ control, name: 'fuel_level' })

    const ChecklistItem = ({ name, label, hint }) => {
      const checked = !!watch(name)
      return (
        <label className={`checklist-item${checked ? ' checked' : ''}`}>
          <input
            type="checkbox"
            {...register(name)}
          />
          <span className="checklist-box">
            {checked && <Check size={12} />}
          </span>
          <span className="checklist-text">
            <span className="checklist-label">{label}</span>
            {hint && <span className="checklist-hint">{hint}</span>}
          </span>
        </label>
      )
    }

    return (
      <div className="wizard-step-body">
        <div className="form-row">
          <div className="form-group">
            <label className="label-intecsa">Nivel de combustible al salir</label>
            <FuelLevelSlider
              value={fuelLevel || 50}
              onChange={(val) => setValue('fuel_level', val, { shouldValidate: false })}
            />
            <p className="help-text">Marca el tanque de gasolina antes de partir.</p>
          </div>
          <div className="form-group">
            <label className="label-intecsa">
              Carga / mercancía <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
            </label>
            <input
              className="input-intecsa"
              placeholder="Ej. 28 ton perfiles de acero"
              {...register('cargo_description')}
            />
            <p className="help-text">Descripción de lo que transporta la unidad.</p>
          </div>
        </div>

        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
          <Truck size={14} />
          Revisión visual de la unidad
        </div>

        <div className="checklist-grid">
          <ChecklistItem name="checklist_extintor" label="Extintor" hint="Vigente y con presión" />
          <ChecklistItem name="checklist_llanta_refaccion" label="Llanta de refacción" hint="Inflada y en buen estado" />
          <ChecklistItem name="checklist_herramientas" label="Herramientas básicas" hint="Llave de cruz, desarmadores" />
          <ChecklistItem name="checklist_gato" label="Gato y cruceta" hint="Funcionales" />
          <ChecklistItem name="checklist_cinturon" label="Cinturones de seguridad" hint="Conductor y pasajeros" />
          <ChecklistItem name="checklist_documentos" label="Documentos del vehículo" hint="Tarjeta de circulación, póliza" />
          <ChecklistItem name="checklist_tarjetas" label="Tarjetas de combustible / peaje" hint="Asignadas al operador" />
        </div>

        <div className="form-group" style={{ marginTop: 8 }}>
          <label className="label-intecsa">
            Observaciones de salida <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
          </label>
          <textarea
            className="input-intecsa"
            rows={3}
            placeholder="Golpes visibles, fallas, faltantes o cualquier nota sobre la unidad."
            style={{ resize: 'vertical', minHeight: 64, fontFamily: 'inherit' }}
            {...register('checklist_observaciones')}
          />
        </div>
      </div>
    )
  }

  const StepFacturacion = () => {
    const requestDate = useWatch({ control, name: 'request_date' })
    const deliveryDate = useWatch({ control, name: 'delivery_date' })

    return (
      <div className="wizard-step-body">
        <div className="form-group">
          <label className="label-intecsa">
            Folio fiscal (CFDI) <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
          </label>
          <input className="input-intecsa" placeholder="UUID del comprobante" {...register('document_id')} />
        </div>

        <div className="form-group">
          <RentaConceptsBreakdown
            requestDate={requestDate}
            deliveryDate={deliveryDate}
            control={control}
            setValue={setValue}
            planName={planByVehicle.find(p => p._id === planWatchSelected)?.planName || ''}
          />
        </div>

        <div className="form-group">
          <label className="label-intecsa">
            Tarjeta / forma de pago <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
          </label>
          <input
            className="input-intecsa"
            placeholder="Ej. Tarjeta corporativa ••4471, SPEI, Efectivo, etc."
            {...register('tarjeta_deposito')}
          />
        </div>
      </div>
    )
  }

  const StepResumen = ({ goTo }) => {
    const data = watch()
    const planSelected = planByVehicle.find(p => p._id === planWatchSelected)
    const empresaName = EMPRESAS.find(e => e._id === data.client)?.name || '—'
    const isTrasladoFlete = type === 'traslado' || type === 'flete'

    const fmtMoney = (v) => {
      if (!v || isNaN(v)) return '—'
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(v)
    }

    const liveStops = (data.stops || []).filter(s => s && s.trim())
    const liveRoute = [data.origin, ...liveStops, data.destination].filter(Boolean).join(' → ')

    const computeConcept = (rate, unit, qty, dias) => {
      const r = Number(rate || 0)
      if (!r) return 0
      if (unit === 'fijo') return r
      let cant = (qty === '' || qty == null || qty === undefined) ? null : Number(qty)
      if (cant === null || cant === undefined) {
        cant = Number(dias) || 1
      }
      return r * cant
    }

    const diasPeriodo = (() => {
      if (!data.request_date || !data.delivery_date) return 1
      const d = Math.round((new Date(data.delivery_date) - new Date(data.request_date)) / 86400000)
      return d > 0 ? d : 1
    })()

    const casetasTotal = computeConcept(data.casetas_amount, data.casetas_unit, data.casetas_days, 1)
    const operatorTotal = computeConcept(data.operator_rate, data.operator_unit, data.operator_days, diasPeriodo)
    const perDiemTotal = computeConcept(data.per_diem_rate, data.per_diem_unit, data.per_diem_days, diasPeriodo)
    const gasolineTotal = computeConcept(data.gasoline_rate, data.gasoline_unit, data.gasoline_km ?? '', diasPeriodo)
    const rentaTotal = computeConcept(data.unit_rent_amount, data.unit_rent_unit, data.unit_rent_qty, diasPeriodo)

    const subtotal = casetasTotal + operatorTotal + perDiemTotal + gasolineTotal + rentaTotal
    const profitPct = Number(data.profit_pct || 8)
    const indirectPct = Number(data.indirect_pct || 12)
    const utilidad = subtotal * (profitPct / 100)
    const indirectos = subtotal * (indirectPct / 100)
    const base = subtotal + utilidad + indirectos
    const iva = base * 0.16
    const total = base + iva

    const SumRow = ({ label, val, empty }) => (
      <div className="sum-row">
        <span className="sum-label">{label}</span>
        <span className={`sum-val${empty ? ' empty' : ''}`}>{val}</span>
      </div>
    )

    const SumCard = ({ title, icon: Icon, stepIdx, children }) => (
      <div className="sum-card">
        <div className="sum-head">
          <span className="sum-head-icon"><Icon size={15} /></span>
          <h3>{title}</h3>
          <button className="sum-edit" onClick={() => goTo(stepIdx)} type="button">Editar</button>
        </div>
        <div className="sum-rows">{children}</div>
      </div>
    )

    return (
      <div className="wizard-step-body">
        <div className="sum-grid">
          <SumCard title="Vehículo" icon={Truck} stepIdx={0}>
            <SumRow label="Tipo de documento" val={type ? type.charAt(0).toUpperCase() + type.slice(1) : '—'} empty={!type} />
            <SumRow label="Folio" val={<span className="tnum">{folioLabel}</span>} />
            <SumRow label="Unidad" val={vehicleSelected || 'Sin asignar'} empty={!vehicleSelected} />
            <SumRow label="Plan" val={planSelected?.planName || '—'} empty={!planSelected} />
          </SumCard>

          <SumCard title="Cliente y fechas" icon={Users} stepIdx={1}>
            <SumRow label="Cliente" val={empresaName} />
            <SumRow label="Asunto" val={data.subject || '—'} empty={!data.subject} />
            <SumRow label="Solicitud" val={data.request_date ? dayjs(data.request_date).format('DD MMM YYYY') : '—'} empty={!data.request_date} />
            <SumRow label={type === 'renta' ? 'Dispersión' : 'Entrega'} val={data.delivery_date ? dayjs(data.delivery_date).format('DD MMM YYYY') : '—'} empty={!data.delivery_date} />
          </SumCard>

          <SumCard title="Operativo" icon={MapPin} stepIdx={2}>
            <SumRow label="Conductor" val={data.driver || 'Sin asignar'} empty={!data.driver} />
            <SumRow label="Ruta" val={liveRoute || '—'} empty={!liveRoute} />
            <SumRow label="Recorrido" val={data.recorrido_km ? `${data.recorrido_km} km` : '—'} empty={!data.recorrido_km} />
            <SumRow label="Combustible salida" val={`${data.fuel_level || 0}%`} />
          </SumCard>

          <SumCard title="Facturación" icon={Receipt} stepIdx={3}>
            {casetasTotal > 0 && <SumRow label="Casetas" val={fmtMoney(casetasTotal)} />}
            {operatorTotal > 0 && <SumRow label="Operador" val={fmtMoney(operatorTotal)} />}
            {perDiemTotal > 0 && <SumRow label="Viáticos" val={fmtMoney(perDiemTotal)} />}
            {gasolineTotal > 0 && <SumRow label="Gasolina" val={fmtMoney(gasolineTotal)} />}
            {rentaTotal > 0 && <SumRow label={isTrasladoFlete ? "Renta de unidad" : "Renta por día"} val={fmtMoney(rentaTotal)} />}
            <SumRow label="Subtotal" val={fmtMoney(subtotal)} empty={subtotal === 0} />
            <SumRow label={`Utilidad ${profitPct}%`} val={fmtMoney(utilidad)} />
            <SumRow label={`Indirectos ${indirectPct}%`} val={fmtMoney(indirectos)} />
            <SumRow label="IVA 16%" val={fmtMoney(iva)} />
            <SumRow
              label="Forma de pago"
              val={data.tarjeta_deposito || '—'}
              empty={!data.tarjeta_deposito}
            />
          </SumCard>
        </div>

        {total > 0 && (
          <div className="sum-total-bar">
            <span className="sum-total-label">Total estimado del documento</span>
            <span className="sum-total-amt tnum">{fmtMoney(total)}</span>
          </div>
        )}
      </div>
    )
  }

  const stepContent = [
    <StepTipoVehiculo />,
    <StepClienteFechas />,
    <StepOperativos />,
    <StepRevisionUnidad />,
    <StepFacturacion />,
    <StepResumen goTo={goToStep} />
  ]

  const stepNumberLabel = `Paso ${activeStep + 1} de ${STEPS.length}`
  const stepTitle = STEPS[activeStep]

  return (
    <FormProvider {...methods}>
      <div className="wizard-wrap" ref={panelRef}>
        <div className="wizard-header">
          <div className="wizard-header-left">
            <button
              className="iconbtn-intecsa"
              onClick={handleCancel}
              type="button"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="wizard-header-title">Nuevo documento</h1>
            {type && (
              <>
                <span className="badge-folio">{folioLabel}</span>
                <span className="badge-type">{typeBadgeLabel}</span>
              </>
            )}
          </div>
          <button className="wizard-header-close" onClick={handleCancel} type="button">
            <X size={15} />
            Descartar
          </button>
        </div>

        <div className="wizard-stepper">
          {STEPS.map((label, idx) => (
            <div key={label} className="wizard-step">
              <div
                className={`wizard-step-dot${
                  idx === activeStep
                    ? ' active'
                    : idx < activeStep
                      ? ' done'
                      : ''
                }`}
              >
                {idx < activeStep ? <Check size={14} /> : idx + 1}
              </div>
              <span className="wizard-step-label">{label}</span>
              {idx < STEPS.length - 1 && (
                <div className={`wizard-step-line${idx < activeStep ? ' done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        <div className="wizard-step-header">
          <p className="wizard-step-number">{stepNumberLabel}</p>
          <h2 className="wizard-step-title">{stepTitle}</h2>
          <p className="wizard-step-desc">{STEP_DESCRIPTIONS[activeStep]}</p>
        </div>

        {stepErrors.length > 0 && activeStep < STEPS.length - 1 && (
          <Banner variant="error" stripe title={`Faltan ${stepErrors.length} campo${stepErrors.length !== 1 ? 's' : ''} en este paso`}>
            <ul className="banner-list">
              {stepErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </Banner>
        )}

        <div className="wizard-panel">
          {stepContent[activeStep]}
        </div>

        <div className="wizard-footer-modern">
          <button
            className="btn-intecsa"
            onClick={handleBack}
            disabled={activeStep === 0}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          <span className="wizard-footer-info">
            {stepNumberLabel} · {stepTitle}
          </span>

          {activeStep === STEPS.length - 1 ? (
            <button
              className="btn-intecsa primary"
              onClick={submit}
              disabled={saveData}
              type="button"
            >
              {saveData ? 'Guardando…' : 'Guardar documento'}
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              className="btn-intecsa primary"
              onClick={handleNext}
              type="button"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <NewVehicle
        open={openNewVehicle}
        close={handledNewVehicle}
        empresaId={empresaId}
        chivato={onSaved}
      />
      <NewPlan
        open={newPlan}
        close={handledNewPlan}
        vehicleID={getIdVehicle}
        setPlanByVehicle={setPlanByVehicle}
      />
    </FormProvider>
  )
}
