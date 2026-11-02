import { useState, useMemo, useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  ChevronDown, ChevronUp, User, Wallet, Fuel, Truck, CreditCard
} from 'lucide-react'
import { computeCostBreakdown, computeConceptTotal, computeDiasPeriodo, getStoredRates } from '../../utils/costBreakdown'

const formatCurrency = (value) => {
  if (!value || isNaN(value)) return '$0.00'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/* ─── Unit definitions ─── */
const UNITS = {
  fijo:   { label: 'Monto fijo',    abbr: '',       qty: 'Cantidad',     one: '',       many: '' },
  dia:    { label: 'Por día',       abbr: '/día',   qty: 'Días',         one: 'día',    many: 'días' }
}

const CONCEPTS = [
  {
    key: 'casetas',
    title: 'Casetas',
    subtitle: 'Peajes del trayecto',
    icon: CreditCard,
    defUnit: 'fijo',
    rateField: 'casetas_amount',
    daysField: 'casetas_days',
    unitField: 'casetas_unit',
    notesField: 'casetas_notes',
    fixed: true
  },
  {
    key: 'operador',
    title: 'Operador',
    subtitle: 'Sueldo y prestaciones',
    icon: User,
    defUnit: 'dia',
    rateField: 'operator_rate',
    daysField: 'operator_days',
    unitField: 'operator_unit',
    notesField: 'operator_notes'
  },
  {
    key: 'viaticos',
    title: 'Viáticos',
    subtitle: 'Hospedaje y alimentos',
    icon: Wallet,
    defUnit: 'dia',
    rateField: 'per_diem_rate',
    daysField: 'per_diem_days',
    unitField: 'per_diem_unit',
    notesField: 'per_diem_notes'
  },
  {
    key: 'gasolina',
    title: 'Gasolina',
    subtitle: 'Combustible del trayecto',
    icon: Fuel,
    defUnit: 'fijo',
    rateField: 'gasoline_rate',
    daysField: 'gasoline_km',
    unitField: 'gasoline_unit',
    notesField: 'gasoline_notes',
    fixed: true
  },
  {
    key: 'renta',
    title: 'Renta de unidad',
    subtitle: 'Arrendamiento del vehículo',
    icon: Truck,
    defUnit: 'dia',
    rateField: 'unit_rent_amount',
    daysField: 'unit_rent_qty',
    unitField: 'unit_rent_unit',
    notesField: 'unit_rent_notes'
  }
]

/* ─── Helpers ─── */
const cleanDecimal = (v) => String(v ?? '').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
const cleanInteger = (v) => String(v ?? '').replace(/[^\d]/g, '')

/* ─── Inputs using react-hook-form register (no focus loss) ─── */
const NumberField = ({ name, label, hint, prefix, suffix, placeholder, inputMode = 'decimal', allowDecimal = true }) => {
  const { register, setValue } = useFormContext()

  const { ref, ...rest } = register(name, {
    setValueAs: (v) => {
      const cleaned = allowDecimal ? cleanDecimal(v) : cleanInteger(v)
      return cleaned === '' ? 0 : Number(cleaned)
    }
  })

  const handleChange = (e) => {
    const cleaned = allowDecimal ? cleanDecimal(e.target.value) : cleanInteger(e.target.value)
    e.target.value = cleaned
    rest.onChange(e)
    // Guardar string mientras escribe para no perder decimales a medio escribir
    if (cleaned === '' || cleaned.endsWith('.')) {
      setValue(name, cleaned, { shouldValidate: false, shouldDirty: true })
    }
  }

  const handleBlur = (e) => {
    const cleaned = allowDecimal ? cleanDecimal(e.target.value) : cleanInteger(e.target.value)
    e.target.value = cleaned
    rest.onChange(e)
    rest.onBlur(e)
  }

  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className="curr" style={{ position: 'relative' }}>
        {prefix && <span className="sym">$</span>}
        <input
          type="text"
          inputMode={inputMode}
          placeholder={placeholder}
          className="input-intecsa"
          style={prefix ? { paddingLeft: 26, width: '100%' } : { width: '100%' }}
          {...rest}
          ref={ref}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {suffix && (
          <span className="sym" style={{ left: 'auto', right: 13, fontSize: 13, color: 'var(--muted)' }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}

const PercentField = ({ name, label }) => {
  const { register, setValue } = useFormContext()

  const { ref, ...rest } = register(name, {
    setValueAs: (v) => {
      const cleaned = cleanDecimal(v)
      return cleaned === '' ? 0 : Number(cleaned)
    }
  })

  const handleChange = (e) => {
    const cleaned = cleanDecimal(e.target.value)
    e.target.value = cleaned
    rest.onChange(e)
    if (cleaned === '' || cleaned.endsWith('.')) {
      setValue(name, cleaned, { shouldValidate: false, shouldDirty: true })
    }
  }

  return (
    <span className="bt-k">
      {label}{' '}
      <span className="pct-in">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          className="tnum"
          {...rest}
          ref={ref}
          onChange={handleChange}
        />
        <span>%</span>
      </span>
    </span>
  )
}

/* ─── Concept accordion item ─── */
const ConceptItem = ({
  concept,
  open,
  onToggle,
  control,
  setValue,
  defaultDays = 1
}) => {
  const rateRaw = useWatch({ control, name: concept.rateField })
  const qtyRaw = useWatch({ control, name: concept.daysField })
  const unit = useWatch({ control, name: concept.unitField }) || concept.defUnit
  const notes = useWatch({ control, name: concept.notesField }) || ''

  const u = UNITS[unit] || UNITS.fijo
  const isFijo = concept.fixed || unit === 'fijo'

  const rate = Number(rateRaw || 0)
  const qty = isFijo
    ? 1
    : (qtyRaw !== '' && qtyRaw != null ? Number(qtyRaw) : (defaultDays || 1))

  const monto = computeConceptTotal({
    rate: rateRaw,
    unit,
    qty: qtyRaw,
    diasPeriodo: defaultDays,
    fixed: isFijo
  })

  const headSub = rate
    ? (isFijo
      ? 'Monto fijo'
      : `${formatCurrency(rate)} ${u.abbr} × ${qty} ${qty === 1 ? u.one : u.many}`)
    : concept.subtitle

  const setField = (field, value) => {
    setValue(field, value, { shouldValidate: false })
  }

  const suggest = defaultDays || 1

  return (
    <div className={`acc-item ${open ? 'open' : ''}`}>
      <button type="button" className="acc-head" onClick={onToggle}>
        <span className="acc-ic"><concept.icon size={16} /></span>
        <span className="acc-title-group">
          <span className="acc-title">{concept.title}</span>
          <span className="acc-sub">{headSub}</span>
        </span>
        <span className="acc-amt tnum" style={{ color: monto ? 'var(--ink)' : 'var(--muted-2)' }}>
          {monto ? formatCurrency(monto) : '—'}
        </span>
        {open ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
      </button>

      {open && (
        <div className="acc-body">
          <div className="field full">
            <label className="field-label">Unidad de cobro</label>
            <div className="unit-seg">
              <button type="button" className="useg on" disabled>
                {isFijo ? 'Monto fijo' : 'Por día'}
              </button>
            </div>
          </div>

          <NumberField
            name={concept.rateField}
            label={isFijo ? 'Monto' : `Valor ${u.label.toLowerCase()}`}
            prefix
            inputMode="decimal"
            allowDecimal
          />

          {!isFijo && (
            <NumberField
              name={concept.daysField}
              label={u.qty}
              hint={`Sugerido: ${suggest} ${suggest === 1 ? u.one : u.many}`}
              suffix={u.many}
              placeholder={String(suggest)}
              inputMode="numeric"
              allowDecimal={false}
            />
          )}

          <div className="field full">
            <label className="field-label">
              Notas <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span>
            </label>
            <input
              className="input-intecsa"
              style={{ height: 36, fontSize: 13 }}
              placeholder={`Detalle de ${concept.title.toLowerCase()}`}
              value={notes}
              onChange={(e) => setField(concept.notesField, e.target.value)}
            />
          </div>

          <div className="acc-line full">
            <span className="tnum">
              {isFijo
                ? 'Monto fijo'
                : <>{formatCurrency(rate)} <span className="x">×</span> {qty} {qty === 1 ? u.one : u.many}</>
              }
            </span>
            <span className="acc-line-tot tnum">{formatCurrency(monto)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Billing totals panel ─── */
const BillingTotals = ({ subtotal, utilidad, indirectos, base, iva, total }) => {
  return (
    <div className="bill-totals">
      <div className="bt-row">
        <span className="bt-k">Subtotal conceptos</span>
        <span className="bt-v tnum">{formatCurrency(subtotal)}</span>
      </div>
      <div className="bt-row adj">
        <PercentField name="profit_pct" label="Utilidad" />
        <span className="bt-v tnum">{formatCurrency(utilidad)}</span>
      </div>
      <div className="bt-row adj">
        <PercentField name="indirect_pct" label="Indirectos" />
        <span className="bt-v tnum">{formatCurrency(indirectos)}</span>
      </div>
      <div className="bt-row sub">
        <span className="bt-k">Total antes de IVA</span>
        <span className="bt-v tnum">{formatCurrency(base)}</span>
      </div>
      <div className="bt-row">
        <span className="bt-k">IVA 16%</span>
        <span className="bt-v tnum">{formatCurrency(iva)}</span>
      </div>
      <div className="bt-row grand">
        <span className="bt-k">Total a facturar</span>
        <span className="bt-v tnum">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

/* ─── Main component ─── */
const RentaConceptsBreakdown = ({ planName, requestDate, deliveryDate }) => {
  const { control, setValue } = useFormContext()

  const casetasAmount = Number(useWatch({ control, name: 'casetas_amount' }) || 0)
  const casetasUnit = useWatch({ control, name: 'casetas_unit' }) || 'fijo'
  const casetasDays = Number(useWatch({ control, name: 'casetas_days' }) || 0)

  const operatorRate = Number(useWatch({ control, name: 'operator_rate' }) || 0)
  const operatorUnit = useWatch({ control, name: 'operator_unit' }) || 'dia'
  const operatorDays = Number(useWatch({ control, name: 'operator_days' }) || 0)

  const perDiemRate = Number(useWatch({ control, name: 'per_diem_rate' }) || 0)
  const perDiemUnit = useWatch({ control, name: 'per_diem_unit' }) || 'dia'
  const perDiemDays = Number(useWatch({ control, name: 'per_diem_days' }) || 0)

  const gasolineRate = Number(useWatch({ control, name: 'gasoline_rate' }) || 0)
  const gasolineUnit = useWatch({ control, name: 'gasoline_unit' }) || 'fijo'
  const gasolineKm = Number(useWatch({ control, name: 'gasoline_km' }) || 0)

  const unitRentAmount = Number(useWatch({ control, name: 'unit_rent_amount' }) || 0)
  const unitRentUnit = useWatch({ control, name: 'unit_rent_unit' }) || 'dia'
  const unitRentQty = Number(useWatch({ control, name: 'unit_rent_qty' }) || 0)

  const storedRates = useMemo(() => getStoredRates(), [])
  const profitPct = Number(useWatch({ control, name: 'profit_pct' }) || storedRates.profit_pct)
  const indirectPct = Number(useWatch({ control, name: 'indirect_pct' }) || storedRates.indirect_pct)

  const diasPeriodo = useMemo(() => computeDiasPeriodo(requestDate, deliveryDate), [requestDate, deliveryDate])

  const formValues = useMemo(() => ({
    request_date: requestDate,
    delivery_date: deliveryDate,
    profit_pct: profitPct,
    indirect_pct: indirectPct,
    casetas_amount: casetasAmount,
    casetas_unit: casetasUnit,
    casetas_days: casetasDays,
    operator_rate: operatorRate,
    operator_unit: operatorUnit,
    operator_days: operatorDays,
    per_diem_rate: perDiemRate,
    per_diem_unit: perDiemUnit,
    per_diem_days: perDiemDays,
    gasoline_rate: gasolineRate,
    gasoline_unit: gasolineUnit,
    gasoline_km: gasolineKm,
    unit_rent_amount: unitRentAmount,
    unit_rent_unit: unitRentUnit,
    unit_rent_qty: unitRentQty
  }), [
    requestDate, deliveryDate, profitPct, indirectPct,
    casetasAmount, casetasUnit, casetasDays,
    operatorRate, operatorUnit, operatorDays,
    perDiemRate, perDiemUnit, perDiemDays,
    gasolineRate, gasolineUnit, gasolineKm,
    unitRentAmount, unitRentUnit, unitRentQty
  ])

  const breakdown = useMemo(() =>
    computeCostBreakdown(formValues, { diasPeriodo, ivaRate: storedRates.iva_rate }),
  [formValues, diasPeriodo, storedRates.iva_rate])

  const {
    concepts,
    subtotal,
    utilidad,
    indirectos,
    base,
    iva,
    total
  } = breakdown

  /* Sync subtotal to form */
  const prevSubtotal = useRef(subtotal)
  useEffect(() => {
    if (subtotal !== prevSubtotal.current) {
      prevSubtotal.current = subtotal
      setValue('subtotal_travel', Number(subtotal.toFixed(2)), { shouldValidate: false })
    }
  }, [subtotal, setValue])

  const [openKeys, setOpenKeys] = useState(new Set())
  const toggleKey = (key) => {
    setOpenKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {planName && (
        <p className="text-sm font-semibold text-primary mb-1">Plan: {planName}</p>
      )}

      <div className="section-title">
        <CreditCard size={14} />
        Desglose de conceptos
      </div>

      <div className="accordion-list">
        {CONCEPTS.map(c => (
          <ConceptItem
            key={c.key}
            concept={c}
            open={openKeys.has(c.key)}
            onToggle={() => toggleKey(c.key)}
            control={control}
            setValue={setValue}
            defaultDays={diasPeriodo}
          />
        ))}
      </div>

      <BillingTotals
        subtotal={subtotal}
        utilidad={utilidad}
        indirectos={indirectos}
        base={base}
        iva={iva}
        total={total}
      />
    </div>
  )
}

export default RentaConceptsBreakdown
