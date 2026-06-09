import { useState, useMemo, useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  ChevronDown, ChevronUp, User, Wallet, Fuel, Truck, CreditCard
} from 'lucide-react'

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
    fixed: true // casetas no son por día; mantienen "Monto fijo"
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
    defUnit: 'dia',
    rateField: 'gasoline_rate',
    daysField: 'gasoline_km',
    unitField: 'gasoline_unit',
    notesField: 'gasoline_notes'
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

/* ─── Currency input with decimals ─── */
const CurrencyInput = ({ value, onChange, placeholder = '0' }) => {
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    const raw = e.target.value
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1')
    onChange(raw)
  }

  // Format with thousands only when NOT focused (avoid cursor jumps while typing)
  const formatForDisplay = (val) => {
    if (!val) return ''
    const [intPart, decPart] = String(val).split('.')
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decPart != null ? `${intFormatted}.${decPart}` : intFormatted
  }

  return (
    <div className="curr">
      <span className="sym">$</span>
      <input
        type="text"
        inputMode="decimal"
        className="input-intecsa"
        style={{ paddingLeft: 26, width: '100%' }}
        placeholder={placeholder}
        value={focused ? (value || '') : formatForDisplay(value)}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

/* ─── Field wrapper (label + input + hint) ─── */
const Field = ({ label, hint, children, className = '' }) => (
  <div className={`field ${className}`}>
    {label && (
      <label className="field-label">{label}</label>
    )}
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </div>
)

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

  const rate = Number(rateRaw || 0)
  const u = UNITS[unit] || UNITS.fijo
  const isFijo = unit === 'fijo'

  // effective quantity
  let qty = 1
  if (!isFijo) {
    if (qtyRaw !== '' && qtyRaw != null) {
      qty = Number(qtyRaw)
    } else {
      qty = defaultDays || 1
    }
  }

  const monto = isFijo ? rate : rate * qty

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
        <span className="acc-ic">
          <concept.icon size={16} />
        </span>
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
          {/* Unit selector — locked to "Por día" (fijo only for casetas) */}
          <Field label="Unidad de cobro" className="full">
            {concept.fixed ? (
              <div className="unit-seg">
                <button type="button" className="useg on" disabled>
                  Monto fijo
                </button>
              </div>
            ) : (
              <div className="unit-seg">
                <button type="button" className="useg on" disabled>
                  Por día
                </button>
              </div>
            )}
          </Field>

          {/* Value + Quantity */}
          <Field
            label={isFijo ? 'Monto' : `Valor ${u.label.toLowerCase()}`}
          >
            <CurrencyInput
              value={String(rateRaw || '')}
              onChange={(v) => {
                setField(concept.rateField, v)
                if (!isFijo && v && v !== '' && (qtyRaw === '' || qtyRaw == null)) {
                  setField(concept.daysField, '1')
                }
              }}
            />
          </Field>

          {!isFijo && (
            <Field
              label={u.qty}
              hint={`Sugerido: ${suggest} ${suggest === 1 ? u.one : u.many}`}
            >
              <div className="curr">
                <input
                  type="text"
                  inputMode="numeric"
                  className="input-intecsa"
                  style={{ paddingLeft: 12, paddingRight: 50, width: '100%' }}
                  placeholder={String(suggest)}
                  value={qtyRaw || ''}
                  onChange={(e) => setField(concept.daysField, e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))}
                />
                <span className="sym" style={{ left: 'auto', right: 13, fontSize: 13, color: 'var(--muted)' }}>
                  {u.many}
                </span>
              </div>
            </Field>
          )}

          {/* Notes — full width */}
          <Field
            label={<>Notas <span style={{ fontWeight: 500, color: 'var(--muted-2)' }}>(opcional)</span></>}
            className="full"
          >
            <input
              className="input-intecsa"
              style={{ height: 36, fontSize: 13 }}
              placeholder={`Detalle de ${concept.title.toLowerCase()}`}
              value={notes}
              onChange={(e) => setField(concept.notesField, e.target.value)}
            />
          </Field>

          {/* Subtotal line — full width */}
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
const BillingTotals = ({ subtotal, utilidad, indirectos, base, iva, total, profitPct, indirectPct, setValue }) => {
  const PctInput = ({ value, onChange }) => (
    <span className="pct-in">
      <input
        className="tnum"
        inputMode="numeric"
        value={value}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
          onChange(raw === '' ? 0 : Number(raw))
        }}
      />
      <span>%</span>
    </span>
  )

  return (
    <div className="bill-totals">
      <div className="bt-row">
        <span className="bt-k">Subtotal conceptos</span>
        <span className="bt-v tnum">{formatCurrency(subtotal)}</span>
      </div>
      <div className="bt-row adj">
        <span className="bt-k">
          Utilidad <PctInput value={profitPct} onChange={(v) => setValue('profit_pct', v, { shouldValidate: false })} />
        </span>
        <span className="bt-v tnum">{formatCurrency(utilidad)}</span>
      </div>
      <div className="bt-row adj">
        <span className="bt-k">
          Indirectos <PctInput value={indirectPct} onChange={(v) => setValue('indirect_pct', v, { shouldValidate: false })} />
        </span>
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

  /* Watch all concept fields */
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
  const gasolineUnit = useWatch({ control, name: 'gasoline_unit' }) || 'dia'
  const gasolineKm = useWatch({ control, name: 'gasoline_km' })

  const unitRentAmount = Number(useWatch({ control, name: 'unit_rent_amount' }) || 0)
  const unitRentUnit = useWatch({ control, name: 'unit_rent_unit' }) || 'dia'
  const unitRentQty = Number(useWatch({ control, name: 'unit_rent_qty' }) || 0)

  const profitPct = Number(useWatch({ control, name: 'profit_pct' }) || 8)
  const indirectPct = Number(useWatch({ control, name: 'indirect_pct' }) || 12)

  /* Compute days from dates */
  const diasPeriodo = useMemo(() => {
    if (!requestDate || !deliveryDate) return 1
    const d = Math.round((new Date(deliveryDate) - new Date(requestDate)) / 86400000)
    return d > 0 ? d : 1
  }, [requestDate, deliveryDate])

  /* Helper to compute concept total */
  const computeConcept = (rate, unit, qty, dias) => {
    if (!rate) return 0
    if (unit === 'fijo') return rate
    let cant = qty
    if (cant === '' || cant == null || cant === undefined) {
      cant = dias || 1
    }
    return rate * cant
  }

  const casetasTotal = computeConcept(casetasAmount, casetasUnit, casetasDays, 1)
  const operatorTotal = computeConcept(operatorRate, operatorUnit, operatorDays, diasPeriodo)
  const perDiemTotal = computeConcept(perDiemRate, perDiemUnit, perDiemDays, diasPeriodo)
  const gasolineTotal = computeConcept(gasolineRate, gasolineUnit, gasolineKm ?? '', diasPeriodo)
  const rentaTotal = computeConcept(unitRentAmount, unitRentUnit, unitRentQty, diasPeriodo)

  const subtotal = casetasTotal + operatorTotal + perDiemTotal + gasolineTotal + rentaTotal
  const utilidad = subtotal * (profitPct / 100)
  const indirectos = subtotal * (indirectPct / 100)
  const base = subtotal + utilidad + indirectos
  const iva = base * 0.16
  const total = base + iva

  /* Sync subtotal to form (always — even when 0, so backend receives a number) */
  const prevSubtotal = useRef(subtotal)
  useEffect(() => {
    if (subtotal !== prevSubtotal.current) {
      prevSubtotal.current = subtotal
      setValue('subtotal_travel', Number(subtotal.toFixed(2)), { shouldValidate: false })
    }
  }, [subtotal, setValue])

  // allow multiple accordion sections to be open simultaneously
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
        profitPct={String(profitPct || '')}
        indirectPct={String(indirectPct || '')}
        setValue={setValue}
      />
    </div>
  )
}

export default RentaConceptsBreakdown
