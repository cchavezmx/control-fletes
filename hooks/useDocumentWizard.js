/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { useGlobalState } from '../context/GlobalContext'

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
  subtotal_travel: 'Subtotal'
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
      gasoline_unit: 'dia',
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

  console.log('plan', errors)

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
    const fieldsPerStep = [
      [],
      ['client', 'subject', 'request_date', 'delivery_date'],
      ['driver', 'origin', 'destination'],
      [],
      []
    ]

    if (activeStep === 0) {
      const errs = []
      if (!type) errs.push('Selecciona el tipo de documento')
      if (!vehicleSelected) errs.push('Selecciona un vehículo')
      if (errs.length) { setStepErrors(errs); scrollToTop(); return }
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
        setStepErrors(['Captura al menos un concepto (tarifa > 0) en el desglose'])
        scrollToTop()
        return
      }
    } else {
      const valid = await trigger(fieldsPerStep[activeStep])
      if (!valid) {
        const stepFields = fieldsPerStep[activeStep]
        const errs = stepFields
          .filter(f => errors[f])
          .map(f => errors[f]?.message || `${FIELD_LABELS[f] || f} es obligatorio`)
        setStepErrors(errs)
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

    const payload = {
      ...normalized,
      route: routeDerived,
      description: planSelected,
      vehicle: vehicleSelected,
      bussiness_cost: empresaId,
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

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`Error ${res.status}: ${errText || res.statusText}`)
      }

      const data = await res.json().catch(() => ({}))
      console.log('[flotilla/insert] response:', data)

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

  const submit = handleSubmit(onSubmit)

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
