/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { useGlobalState } from '../context/GlobalContext'
import { computeCostBreakdown } from '../utils/costBreakdown'

// ─── Schema (exported for reuse) ───
export const DOCUMENT_SCHEMA = z.object({
  plan: z.string().min(1, 'Selecciona un plan'),
  client: z.string().min(1, 'Selecciona un cliente'),
  subject: z.string().min(1, 'El asunto es obligatorio'),
  request_date: z.string().min(1, 'La fecha de solicitud es obligatoria'),
  delivery_date: z.string().min(1, 'La fecha de dispersión es obligatoria'),
  driver: z.string().min(1, 'El conductor es obligatorio'),
  origin: z.string().min(1, 'El origen es obligatorio'),
  destination: z.string().min(1, 'El destino es obligatorio'),
  stops: z.array(z.string().optional()).optional(),
  route: z.string().optional(),
  recorrido_km: z.string().optional(),
  kilometer_out: z.string().optional(),
  subtotal_travel: z.number({ invalid_type_error: 'El subtotal es obligatorio', required_error: 'El subtotal es obligatorio' }).min(0, 'Subtotal inválido'),
  fuel_level: z.number({ invalid_type_error: 'Nivel de combustible inválido' }).min(0).max(100),
  document_id: z.string().optional(),
  project_id: z.string().optional(),
  fuel_card: z.string().optional(),
  fuel_amount: z.string().optional(),
  link_googlemaps: z.string().optional(),
  casetas: z.string().optional(),
  tarjeta_deposito: z.string().optional(),
  casetas_amount: z.string().optional(),
  casetas_unit: z.string().optional(),
  casetas_days: z.string().optional(),
  casetas_notes: z.string().optional(),
  casetas_num: z.string().optional(),
  operator_rate: z.string().optional(),
  operator_unit: z.string().optional(),
  operator_days: z.string().optional(),
  operator_notes: z.string().optional(),
  per_diem_rate: z.string().optional(),
  per_diem_unit: z.string().optional(),
  per_diem_days: z.string().optional(),
  per_diem_notes: z.string().optional(),
  gasoline_rate: z.string().optional(),
  gasoline_unit: z.string().optional(),
  gasoline_km: z.string().optional(),
  gasoline_notes: z.string().optional(),
  unit_rent_amount: z.string().optional(),
  unit_rent_unit: z.string().optional(),
  unit_rent_qty: z.string().optional(),
  unit_rent_notes: z.string().optional(),
  unit_rent_period: z.string().optional(),
  profit_pct: z.number({ invalid_type_error: 'Porcentaje de utilidad inválido' }).min(0).max(100),
  indirect_pct: z.number({ invalid_type_error: 'Porcentaje de indirectos inválido' }).min(0).max(100),
  priority: z.string().optional(),
  cost_center: z.string().optional(),
  cargo_description: z.string().optional(),
  operator_notes: z.string().optional(),
  // Revisión de unidad
  checklist_extintor: z.boolean().optional(),
  checklist_llanta_refaccion: z.boolean().optional(),
  checklist_herramientas: z.boolean().optional(),
  checklist_gato: z.boolean().optional(),
  checklist_cinturon: z.boolean().optional(),
  checklist_documentos: z.boolean().optional(),
  checklist_tarjetas: z.boolean().optional(),
  checklist_observaciones: z.string().optional()
})

export const STEPS = [
  'Tipo y Vehículo',
  'Cliente y Fechas',
  'Detalles Operativos',
  'Revisión de Unidad',
  'Facturación',
  'Resumen'
]

const FIELD_LABELS = {
  client: 'Cliente',
  subject: 'Asunto',
  request_date: 'Fecha de solicitud',
  delivery_date: 'Fecha de entrega / dispersión',
  driver: 'Conductor',
  origin: 'Origen',
  destination: 'Destino',
  subtotal_travel: 'Subtotal',
  fuel_level: 'Nivel de combustible',
  plan: 'Plan del vehículo',
  vehicle: 'Vehículo'
}

const TEXT_FIELDS_UPPER = ['driver']
const TEXT_FIELDS_TITLE = ['subject']
const TEXT_FIELDS_TRIM = [
  'origin', 'destination', 'cargo_description',
  'document_id', 'tarjeta_deposito', 'link_googlemaps', 'notes'
]

const cleanText = (val) => (val == null ? '' : String(val).replace(/\s+/g, ' ').trim())
const upperText = (val) => cleanText(val).toUpperCase()
const titleText = (val) => cleanText(val).toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

const API = process.env.NEXT_PUBLIC_API

const fetchFoliosByEmpresa = async (empresaId) => {
  const { message } = await fetch(`${API}/folios/${empresaId}`).then(r => r.json())
  return message
}

const fetchVehicleBySlug = async (slug) => {
  const { planes } = await fetch(`${API}/flotilla/planes/slug/${slug}`).then(r => r.json())
  return planes
}

const useDocumentWizard = ({ empresaId, listVehicles = [], onCancel, onSaved } = {}) => {
  const { saveLastDocuments } = useGlobalState()

  const [activeStep, setActiveStep] = useState(0)
  const [type, setType] = useState('')
  const [vehicleSelected, setVehicleSelected] = useState('')
  const [planByVehicle, setPlanByVehicle] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [folios, setFolios] = useState([])
  const [stepErrors, setStepErrors] = useState([])
  const [saveData, setSaveData] = useState(false)
  const panelRef = useRef(null)

  const methods = useForm({
    resolver: zodResolver(DOCUMENT_SCHEMA),
    defaultValues: {
      request_date: dayjs().format('YYYY-MM-DD'),
      delivery_date: dayjs().format('YYYY-MM-DD'),
      fuel_level: 50,
      subtotal_travel: 0,
      profit_pct: 8,
      indirect_pct: 12,
      casetas_unit: 'fijo',
      operator_unit: 'dia',
      per_diem_unit: 'dia',
      gasoline_unit: 'fijo',
      unit_rent_unit: 'dia',
      origin: '',
      destination: '',
      stops: [],
      checklist_extintor: true,
      checklist_llanta_refaccion: true,
      checklist_herramientas: true,
      checklist_gato: true,
      checklist_cinturon: true,
      checklist_documentos: true,
      checklist_tarjetas: true,
      checklist_observaciones: ''
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    trigger,
    formState: { errors }
  } = methods

  // console.log('plan errors', errors)

  const planWatchSelected = watch('plan')

  // Load folios on empresa change
  useEffect(() => {
    if (!empresaId) return
    fetchFoliosByEmpresa(empresaId).then(setFolios)
  }, [empresaId])

  // Load plans when vehicle changes
  useEffect(() => {
    if (!vehicleSelected) {
      setPlanByVehicle([])
      return
    }
    let cancelled = false
    setLoadingPlans(true)
    fetchVehicleBySlug(vehicleSelected)
      .then((planes) => { if (!cancelled) setPlanByVehicle(planes) })
      .finally(() => { if (!cancelled) setLoadingPlans(false) })
    return () => { cancelled = true }
  }, [vehicleSelected])

  const getIdVehicle = useMemo(() => {
    if (!vehicleSelected) return undefined
    return listVehicles?.find(item => item.placas === vehicleSelected)?._id
  }, [vehicleSelected, listVehicles])

  const handleCancel = useCallback(() => {
    reset()
    setType('')
    setVehicleSelected('')
    setPlanByVehicle([])
    setActiveStep(0)
    setStepErrors([])
    onCancel?.()
  }, [reset, onCancel])

  const scrollToTop = useCallback(() => {
    // 1) Window/page scroll (when wizard renders as a full page route)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // 2) Panel ref (when wizard is mounted inside a Drawer/modal)
    const el = panelRef.current
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const handleNext = useCallback(async () => {
    // Validar TODO el formulario al avanzar, no solo los campos del paso actual.
    const valid = await trigger()
    if (!valid) {
      const allErrors = Object.entries(errors)
        .filter(([, err]) => err != null)
        .map(([field, err]) => {
          const label = FIELD_LABELS[field] || field
          return `${label}: ${err?.message || 'inválido'}`
        })
      if (allErrors.length > 0) {
        setStepErrors(allErrors)
        toast.error(`Revisa el formulario:\n${allErrors.join('\n')}`)
      }
      scrollToTop()
      return
    }

    // Validaciones específicas por paso (tipo/vehículo y desglose)
    if (activeStep === 0) {
      const errs = []
      if (!type) errs.push('Selecciona el tipo de documento')
      if (!vehicleSelected) errs.push('Selecciona un vehículo')
      if (errs.length) { setStepErrors(errs); toast.error(errs.join('\n')); scrollToTop(); return }
    } else if (activeStep === 4) {
      const current = watch()
      const conceptRates = [
        current.casetas_amount,
        current.operator_rate,
        current.per_diem_rate,
        current.gasoline_rate,
        current.unit_rent_amount
      ]
      const hasAny = conceptRates.some(r => r && Number(r) > 0)
      if (!hasAny) {
        const msg = 'Captura al menos un concepto (tarifa > 0) en el desglose'
        setStepErrors([msg])
        toast.error(msg)
        scrollToTop()
        return
      }
    }

    setStepErrors([])
    setActiveStep((prev) => prev + 1)
  }, [activeStep, type, vehicleSelected, watch, trigger, errors, scrollToTop])

  const handleBack = useCallback(() => {
    setStepErrors([])
    setActiveStep((prev) => prev - 1)
  }, [])

  const goToStep = useCallback((idx) => {
    setStepErrors([])
    setActiveStep(idx)
  }, [])

  const onSubmit = useCallback(async (data) => {
    setSaveData(true)
    const planSelected = planByVehicle.find(item => item._id === data.plan)

    if (!planSelected) {
      console.warn('[wizard] no hay plan seleccionado')
      toast.error('Selecciona un plan del vehículo antes de guardar')
      setSaveData(false)
      return
    }

    // Normalize strings
    const normalized = { ...data }
    for (const f of TEXT_FIELDS_UPPER) normalized[f] = upperText(data[f])
    for (const f of TEXT_FIELDS_TITLE) normalized[f] = titleText(data[f])
    for (const f of TEXT_FIELDS_TRIM) normalized[f] = cleanText(data[f])
    if (Array.isArray(data.stops)) {
      normalized.stops = data.stops.map(cleanText)
    }

    // Derive route from origin + stops + destination (backward compat)
    const stopsClean = (normalized.stops || []).filter(Boolean)
    const segments = [normalized.origin, ...stopsClean, normalized.destination].filter(Boolean)
    const routeDerived = segments.join(' → ')

    // Gasolina: el wizard la captura como monto fijo, por lo que forzamos
    // gasoline_km a 1 para evitar que el servicio de PDF la multiplique por
    // el recorrido. Si en el futuro se expone modo por-km, se heredará
    // recorrido_km cuando la unidad sea 'km'.
    normalized.gasoline_km = normalized.gasoline_unit === 'km'
      ? (Number(normalized.gasoline_km) || Number(normalized.recorrido_km) || 1)
      : 1

    // Build cost_breakdown subdocument for the PDF service spec
    // (docs/pdf-payload-spec.md §3.4, §4, §5.2)
    const breakdown = computeCostBreakdown(normalized)
    const profitAmount = breakdown.utilidad
    const indirectAmount = breakdown.indirectos

    const cost_breakdown = {
      casetas_amount:   breakdown.concepts.casetas.rate,
      casetas_unit:     breakdown.concepts.casetas.unit,
      casetas_days:     breakdown.concepts.casetas.days,
      casetas_notes:    breakdown.concepts.casetas.notes,
      operator_rate:    breakdown.concepts.operator.rate,
      operator_unit:    breakdown.concepts.operator.unit,
      operator_days:    breakdown.concepts.operator.days,
      operator_notes:   breakdown.concepts.operator.notes,
      per_diem_rate:    breakdown.concepts.perDiem.rate,
      per_diem_unit:    breakdown.concepts.perDiem.unit,
      per_diem_days:    breakdown.concepts.perDiem.days,
      per_diem_notes:   breakdown.concepts.perDiem.notes,
      gasoline_rate:    breakdown.concepts.gasoline.rate,
      gasoline_unit:    breakdown.concepts.gasoline.unit,
      gasoline_km:      breakdown.concepts.gasoline.km,
      gasoline_notes:   breakdown.concepts.gasoline.notes,
      unit_rent_amount: breakdown.concepts.unitRent.rate,
      unit_rent_unit:   breakdown.concepts.unitRent.unit,
      unit_rent_qty:    breakdown.concepts.unitRent.qty,
      unit_rent_notes:  breakdown.concepts.unitRent.notes,
      unit_rent_period: breakdown.concepts.unitRent.period || 'dia',
      profit_amount:    profitAmount,
      indirect_amount:  indirectAmount
    }

    const payload = {
      ...normalized,
      route: routeDerived,
      description: planSelected,
      vehicle: vehicleSelected,
      bussiness_cost: empresaId,
      cost_breakdown,
      profit_amount: profitAmount,
      indirect_amount: indirectAmount,
      // Revisión de unidad (pre-flight checklist)
      pre_flight: {
        fuel_level: Number(normalized.fuel_level ?? 0),
        cargo_description: normalized.cargo_description || '',
        items: {
          extintor: !!normalized.checklist_extintor,
          llanta_refaccion: !!normalized.checklist_llanta_refaccion,
          herramientas: !!normalized.checklist_herramientas,
          gato: !!normalized.checklist_gato,
          cinturon: !!normalized.checklist_cinturon,
          documentos: !!normalized.checklist_documentos,
          tarjetas: !!normalized.checklist_tarjetas
        },
        observaciones: normalized.checklist_observaciones || ''
      }
    }

    saveLastDocuments([payload])

    try {
      const res = await fetch(`${API}/flotilla/insert?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json().catch(() => ({}))
      console.log('[flotilla/insert] response:', data)

      if (!res.ok || data.success === false) {
        const backendMessage = data?.message || data?.error || ''
        const errText = backendMessage || (await res.text().catch(() => ''))
        throw new Error(
          `Error ${res.status}: ${errText || res.statusText || 'No se pudo guardar el documento'}`
        )
      }

      toast.success('Documento guardado')
      handleCancel()
      onSaved?.()
    } catch (err) {
      console.error('[flotilla/insert] failed:', err)
      toast.error(err.message || 'No se pudo guardar el documento')
    } finally {
      setSaveData(false)
    }
  }, [planByVehicle, vehicleSelected, empresaId, type, saveLastDocuments, handleCancel, onSaved])

  const submit = handleSubmit(
    onSubmit,
    (formErrors) => {
      console.error('[wizard] validation errors on submit:', formErrors)
      const messages = Object.entries(formErrors)
        .filter(([, err]) => err != null)
        .map(([field, err]) => {
          const label = FIELD_LABELS[field] || field
          const msg = err?.message || 'inválido'
          return `${label}: ${msg}`
        })
      if (messages.length > 0) {
        toast.error(`No se puede guardar:\n${messages.join('\n')}`)
      } else {
        toast.error('Hay campos inválidos en el formulario')
      }
      setSaveData(false)
    }
  )

  // ─── Derived labels ───
  const typeBadgeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : ''
  const folioLabel = type
    ? `${type.charAt(0).toUpperCase() + type.slice(1)} ${(folios[`${type}s`] || 0) + 1}`
    : '—'

  return {
    // Form
    methods,
    register,
    control,
    setValue,
    watch,
    errors,

    // Wizard state
    activeStep,
    type,
    setType,
    vehicleSelected,
    setVehicleSelected,
    planByVehicle,
    setPlanByVehicle,
    loadingPlans,
    getIdVehicle,
    folios,
    stepErrors,
    saveData,
    panelRef,

    // Actions
    handleNext,
    handleBack,
    goToStep,
    handleCancel,
    submit,
    scrollToTop,

    // Derived
    typeBadgeLabel,
    folioLabel
  }
}

export default useDocumentWizard
