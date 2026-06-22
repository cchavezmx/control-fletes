/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  LayoutGrid,
  Table as TableIcon,
  Calendar,
  BarChart3,
  GitBranch,
  Plus,
  Filter,
  Search,
  Bell,
  Link2,
  Bug,
  CheckCircle2,
  XCircle,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  ChevronDown,
  Zap,
  Hash,
  Code2,
  Mail,
  Workflow,
  X,
  Trash2,
  GripVertical,
  CalendarRange
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────────────────
   1. DESIGN TOKENS — paleta monday.com + design tokens del proyecto
   ────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  PENDIENTE: 'Sin Iniciar',
  PASÓ: 'Pasó ✔️',
  FALLÓ: 'Falló ❌'
}

const STATUS_STYLES = {
  [STATUS.PENDIENTE]: {
    pill: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    button: 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-slate-200'
  },
  [STATUS.PASÓ]: {
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    button: 'bg-emerald-500 text-white hover:bg-emerald-600 ring-1 ring-emerald-500'
  },
  [STATUS.FALLÓ]: {
    pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
    button: 'bg-rose-500 text-white hover:bg-rose-600 ring-1 ring-rose-500'
  }
}

const SEVERITY_STYLES = {
  Baja: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  Media: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Crítico: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-200'
}

const GROUP_COLORS = {
  'Módulo: Autenticación': 'bg-indigo-500',
  'Módulo: Dashboard': 'bg-cyan-500',
  'Módulo: UI Principal': 'bg-violet-500',
  'Bugs Activos': 'bg-rose-500'
}

const DEVICE_ICON = {
  'Chrome Desktop': Monitor,
  'Firefox Desktop': Globe,
  'Safari iPhone': Smartphone,
  'Safari iPad': Smartphone,
  'Edge Desktop': Monitor,
  'Android Chrome': Smartphone
}

/* ──────────────────────────────────────────────────────────────────────────
   2. DATOS MOCKEADOS (estado inicial)
   ────────────────────────────────────────────────────────────────────────── */
// Genera una fecha ISO (YYYY-MM-DD) hace N días respecto a hoy
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const INITIAL_ITEMS = [
  {
    id: 'qa-001',
    name: 'Validar responsividad en Navbar',
    section: 'Global/UI',
    device: 'Chrome Desktop',
    status: STATUS.PASÓ,
    severity: 'Baja',
    delivery_date: daysAgo(2),
    originalGroup: 'Módulo: UI Principal',
    currentGroup: 'Módulo: UI Principal'
  },
  {
    id: 'qa-002',
    name: 'Carga infinita al filtrar por fecha',
    section: 'Dashboard',
    device: 'Chrome Desktop',
    status: STATUS.FALLÓ,
    severity: 'Crítico',
    delivery_date: daysAgo(5),
    originalGroup: 'Módulo: Dashboard',
    currentGroup: 'Bugs Activos'
  },
  {
    id: 'qa-003',
    name: 'Login con Google rompe sesión',
    section: 'Login',
    device: 'Safari iPhone',
    status: STATUS.FALLÓ,
    severity: 'Crítico',
    delivery_date: daysAgo(1),
    originalGroup: 'Módulo: Autenticación',
    currentGroup: 'Bugs Activos'
  },
  {
    id: 'qa-004',
    name: 'Validar campos obligatorios en formulario',
    section: 'Registro',
    device: 'Firefox Desktop',
    status: STATUS.PENDIENTE,
    severity: 'Media',
    delivery_date: daysAgo(10),
    originalGroup: 'Módulo: Autenticación',
    currentGroup: 'Módulo: Autenticación'
  },
  {
    id: 'qa-005',
    name: 'Sidebar colapsa correctamente en mobile',
    section: 'Sidebar',
    device: 'Safari iPhone',
    status: STATUS.PASÓ,
    severity: 'Baja',
    delivery_date: daysAgo(7),
    originalGroup: 'Módulo: UI Principal',
    currentGroup: 'Módulo: UI Principal'
  },
  {
    id: 'qa-006',
    name: 'Recuperar contraseña no envía correo',
    section: 'Login',
    device: 'Edge Desktop',
    status: STATUS.FALLÓ,
    severity: 'Media',
    delivery_date: daysAgo(3),
    originalGroup: 'Módulo: Autenticación',
    currentGroup: 'Bugs Activos'
  },
  {
    id: 'qa-007',
    name: 'Carga de widgets tarda más de 5s',
    section: 'Dashboard',
    device: 'Chrome Desktop',
    status: STATUS.PENDIENTE,
    severity: 'Media',
    delivery_date: daysAgo(14),
    originalGroup: 'Módulo: Dashboard',
    currentGroup: 'Módulo: Dashboard'
  },
  {
    id: 'qa-008',
    name: 'Modal de logout no cierra con ESC',
    section: 'Global/UI',
    device: 'Firefox Desktop',
    status: STATUS.PENDIENTE,
    severity: 'Baja',
    delivery_date: daysAgo(20),
    originalGroup: 'Módulo: UI Principal',
    currentGroup: 'Módulo: UI Principal'
  }
]

const GROUPS_ORDER = [
  'Módulo: Autenticación',
  'Módulo: Dashboard',
  'Módulo: UI Principal',
  'Bugs Activos'
]

const STAGE_COLOR_PALETTE = [
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Cyan', class: 'bg-cyan-500' },
  { name: 'Violet', class: 'bg-violet-500' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Sky', class: 'bg-sky-500' },
  { name: 'Fuchsia', class: 'bg-fuchsia-500' },
  { name: 'Slate', class: 'bg-slate-500' }
]

/* ──────────────────────────────────────────────────────────────────────────
   3. MOTOR DE AUTOMATIZACIÓN — la "regla monday" central
   ──────────────────────────────────────────────────────────────────────────
   Regla: si una fila pasa a FALLÓ, currentGroup = 'Bugs Activos'.
          Si vuelve a PASÓ o PENDIENTE, currentGroup = originalGroup.
*/
const automationRule = (item, newStatus) => {
  if (newStatus === STATUS.FALLÓ) {
    return { ...item, status: newStatus, currentGroup: 'Bugs Activos' }
  }
  return { ...item, status: newStatus, currentGroup: item.originalGroup }
}

/* ──────────────────────────────────────────────────────────────────────────
   4. SUBCOMPONENTES
   ────────────────────────────────────────────────────────────────────────── */
const StatusPill = ({ value, className }) => {
  const styles = STATUS_STYLES[value] ?? STATUS_STYLES[STATUS.PENDIENTE]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles.pill,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {value}
    </span>
  )
}

const SeverityBadge = ({ value }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      SEVERITY_STYLES[value] ?? SEVERITY_STYLES.Baja
    )}
  >
    {value}
  </span>
)

const DeviceCell = ({ value }) => {
  const Icon = DEVICE_ICON[value] ?? Globe
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {value}
    </span>
  )
}

const StageSelect = ({ value, stages, onChange }) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef(null)
  const color = GROUP_COLORS[value] ?? 'bg-slate-400'

  const updateCoords = useCallback(() => {
    const el = buttonRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    if (!open) return undefined
    updateCoords()
    const onScrollOrResize = () => updateCoords()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, updateCoords])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className={cn(
          'inline-flex max-w-[180px] items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-700 transition-colors',
          'hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300'
        )}
      >
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', color)} />
        <span className="truncate">{value}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[1000]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: 220 }}
            className="z-[1001] max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg"
            role="menu"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Mover a stage
            </div>
            {stages.map((s) => {
              const c = GROUP_COLORS[s] ?? 'bg-slate-400'
              const active = s === value
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => { onChange(s); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors',
                    'hover:bg-slate-50',
                    active && 'bg-slate-50'
                  )}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', c)} />
                  <span className="flex-1 text-slate-700">{s}</span>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                </button>
              )
            })}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

const StatusSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const styles = STATUS_STYLES[value] ?? STATUS_STYLES[STATUS.PENDIENTE]

  const updateCoords = useCallback(() => {
    const el = buttonRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  // Recalcular al abrir y al hacer scroll/resize mientras esté abierto
  useEffect(() => {
    if (!open) return undefined
    updateCoords()
    const onScrollOrResize = () => updateCoords()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, updateCoords])

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300',
          styles.button
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
        {value}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[1000]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: 176 }}
            className="z-[1001] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
            role="menu"
          >
            {Object.values(STATUS).map((s) => {
              const ss = STATUS_STYLES[s]
              const active = s === value
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => { onChange(s); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors',
                    'hover:bg-slate-50',
                    active && 'bg-slate-50'
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', ss.dot)} />
                  <span className="text-slate-700">{s}</span>
                  {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-500" />}
                </button>
              )
            })}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   5. KANBAN VIEW (la vista principal de monday)
   ────────────────────────────────────────────────────────────────────────── */
const NewJobInlineForm = ({ stageName, onCreate, onCancel }) => {
  const [name, setName] = useState('')
  const [section, setSection] = useState('Global/UI')
  const [device, setDevice] = useState('Chrome Desktop')
  const [severity, setSeverity] = useState('Media')
  const submit = () => {
    if (!name.trim()) return
    onCreate({ name: name.trim(), section, device, severity })
    setName('')
    setSection('Global/UI')
    setDevice('Chrome Desktop')
    setSeverity('Media')
  }
  return (
    <tr className="border-b border-slate-100 bg-slate-50/40">
      <td className="px-4 py-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onCancel()
          }}
          placeholder="Nombre del caso de prueba…"
          className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Componente"
          className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          className="h-7 w-full rounded-md border border-slate-200 bg-white px-1 text-xs text-slate-700 focus:outline-none"
        >
          {Object.keys(DEVICE_ICON).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="h-7 w-full rounded-md border border-slate-200 bg-white px-1 text-xs text-slate-700 focus:outline-none"
        >
          {['Baja', 'Media', 'Crítico'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[#3f51b5] px-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#3f51b5]/90 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> Crear
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
          >
            <X className="h-3 w-3" /> Cancelar
          </button>
        </div>
      </td>
    </tr>
  )
}

const KanbanView = ({
  items,
  groupsOrder,
  onStatusChange,
  onChangeGroup,
  onReorderItem,
  onCreateJob,
  onDeleteStage,
  onAddStageClick,
  activeNewJobStage,
  onOpenNewJobForm,
  onCancelNewJob
}) => {
  const [draggingItem, setDraggingItem] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (e) => {
    const data = e.active?.data?.current
    if (data?.type === 'item') setDraggingItem(data.item)
  }

  const handleDragEnd = (e) => {
    setDraggingItem(null)
    const { active, over } = e
    if (!over) return
    const aData = active.data?.current
    const oData = over.data?.current
    if (!aData || aData.type !== 'item') return

    // Drop sobre un tbody de otro stage
    if (oData?.type === 'group') {
      const targetGroup = oData.groupName
      if (targetGroup !== aData.item.currentGroup) {
        onChangeGroup(aData.item.id, targetGroup)
      }
      return
    }
    // Drop sobre otra fila (mismo u otro stage)
    if (oData?.type === 'item') {
      const overItem = oData.item
      if (overItem.currentGroup !== aData.item.currentGroup) {
        onChangeGroup(aData.item.id, overItem.currentGroup)
      } else if (overItem.id !== aData.item.id) {
        onReorderItem(aData.item.id, overItem.id)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="space-y-4">
        {groupsOrder.map((groupName) => {
          const groupItems = items.filter((i) => i.currentGroup === groupName)
          const color = GROUP_COLORS[groupName] ?? 'bg-slate-400'
          const isDragTarget = draggingItem && draggingItem.currentGroup !== groupName
          return (
            <KanbanSection
              key={groupName}
              groupName={groupName}
              groupItems={groupItems}
              color={color}
              isDragTarget={isDragTarget}
              stages={groupsOrder}
              onStatusChange={onStatusChange}
              onChangeGroup={onChangeGroup}
              onCreateJob={onCreateJob}
              onDeleteStage={onDeleteStage}
              onOpenNewJobForm={onOpenNewJobForm}
              activeNewJobStage={activeNewJobStage}
              onCancelNewJob={onCancelNewJob}
            />
          )
        })}

        {/* CTA: agregar nuevo stage */}
        <button
          type="button"
          onClick={onAddStageClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-sm font-medium text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo stage
        </button>
      </div>

      <DragOverlay>
        {draggingItem && (
          <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xl">
            <GripVertical className="h-3.5 w-3.5 text-slate-400" />
            {draggingItem.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

/* Sección de un stage: header + tabla droppable */
const KanbanSection = ({
  groupName,
  groupItems,
  color,
  isDragTarget,
  stages,
  onStatusChange,
  onChangeGroup,
  onCreateJob,
  onDeleteStage,
  onOpenNewJobForm,
  activeNewJobStage,
  onCancelNewJob
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `group-${groupName}`,
    data: { type: 'group', groupName }
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'overflow-hidden rounded-xl border bg-white shadow-sm transition-colors',
        isOver || isDragTarget
          ? 'border-slate-400 ring-2 ring-slate-200'
          : 'border-slate-200'
      )}
    >
      <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
          <h2 className="text-sm font-semibold text-slate-800">{groupName}</h2>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {groupItems.length} {groupItems.length === 1 ? 'elemento' : 'elementos'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenNewJobForm(groupName)}
            className="inline-flex items-center gap-1 rounded-md bg-[#3f51b5] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#3f51b5]/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
          <button
            type="button"
            onClick={() => onDeleteStage(groupName)}
            title="Eliminar stage"
            className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="w-8 px-2 py-2.5" />
              <th className="px-4 py-2.5">Caso de Prueba</th>
              <th className="px-4 py-2.5">Stage</th>
              <th className="px-4 py-2.5">Componente</th>
              <th className="px-4 py-2.5">Dispositivo</th>
              <th className="px-4 py-2.5">Severidad</th>
              <th className="px-4 py-2.5">Fecha</th>
              <th className="px-4 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody>
            {groupItems.length === 0 && activeNewJobStage !== groupName ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <p className="text-sm italic text-slate-400">
                    {isDragTarget
                      ? 'Soltar aquí para mover a este stage'
                      : 'Sección limpia — sin elementos pendientes'}
                  </p>
                </td>
              </tr>
            ) : (
              <>
                {groupItems.map((item) => (
                  <DraggableItemRow
                    key={item.id}
                    item={item}
                    stages={stages}
                    onStatusChange={onStatusChange}
                    onChangeGroup={onChangeGroup}
                  />
                ))}
                {activeNewJobStage === groupName && (
                  <NewJobInlineForm
                    stageName={groupName}
                    onCreate={(data) => { onCreateJob(groupName, data); onCancelNewJob() }}
                    onCancel={onCancelNewJob}
                  />
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* Fila arrastrable de un item */
const DraggableItemRow = ({ item, stages, onStatusChange, onChangeGroup }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { type: 'item', item }
  })
  return (
    <tr
      ref={setNodeRef}
      className={cn(
        'border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70',
        isDragging && 'opacity-40'
      )}
    >
      <td className="w-8 px-2 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastrar"
          className="cursor-grab text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{item.name}</span>
          {item.currentGroup !== item.originalGroup && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
              <Workflow className="h-2.5 w-2.5" />
              auto-movido
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <StageSelect
          value={item.currentGroup}
          stages={stages}
          onChange={(s) => onChangeGroup(item.id, s)}
        />
      </td>
      <td className="px-4 py-3 text-slate-600">{item.section}</td>
      <td className="px-4 py-3">
        <DeviceCell value={item.device} />
      </td>
      <td className="px-4 py-3">
        <SeverityBadge value={item.severity} />
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
        {item.delivery_date
          ? new Date(item.delivery_date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
          : '—'}
      </td>
      <td className="px-4 py-3">
        <StatusSelect
          value={item.status}
          onChange={(s) => onStatusChange(item.id, s)}
        />
      </td>
    </tr>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   6. OTRAS VISTAS DINÁMICAS (los 4 pilares)
   ────────────────────────────────────────────────────────────────────────── */
const TableView = ({ items, groupsOrder, onStatusChange, onChangeGroup }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-4 py-2.5">Caso</th>
          <th className="px-4 py-2.5">Stage</th>
          <th className="px-4 py-2.5">Componente</th>
          <th className="px-4 py-2.5">Dispositivo</th>
          <th className="px-4 py-2.5">Severidad</th>
          <th className="px-4 py-2.5">Fecha</th>
          <th className="px-4 py-2.5">Estado</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/70">
            <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
            <td className="px-4 py-3">
              <StageSelect
                value={item.currentGroup}
                stages={groupsOrder}
                onChange={(s) => onChangeGroup(item.id, s)}
              />
            </td>
            <td className="px-4 py-3 text-slate-600">{item.section}</td>
            <td className="px-4 py-3"><DeviceCell value={item.device} /></td>
            <td className="px-4 py-3"><SeverityBadge value={item.severity} /></td>
            <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
              {item.delivery_date
                ? new Date(item.delivery_date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                : '—'}
            </td>
            <td className="px-4 py-3">
              <StatusSelect value={item.status} onChange={(s) => onStatusChange(item.id, s)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const CalendarView = ({ items }) => {
  // distribución simple: agrupar por día simulado (basado en hash del id)
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  const buckets = days.map(() => [])
  items.forEach((it, idx) => { buckets[idx % days.length].push(it) })
  return (
    <div className="grid grid-cols-5 gap-3">
      {days.map((d, i) => (
        <div key={d} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{d}</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
              {buckets[i].length}
            </span>
          </div>
          <div className="space-y-1.5">
            {buckets[i].map((it) => (
              <div
                key={it.id}
                className="rounded-md border border-slate-100 bg-slate-50/60 p-2 text-[11px] text-slate-700"
              >
                <p className="font-medium leading-tight">{it.name}</p>
                <div className="mt-1 flex items-center gap-1">
                  <StatusPill value={it.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const DashboardView = ({ items, groupsOrder }) => {
  const total = items.length
  const passed = items.filter((i) => i.status === STATUS.PASÓ).length
  const failed = items.filter((i) => i.status === STATUS.FALLÓ).length
  const pending = items.filter((i) => i.status === STATUS.PENDIENTE).length
  const pct = (n) => (total === 0 ? 0 : Math.round((n / total) * 100))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total', value: total, color: 'text-slate-700', bg: 'bg-slate-50', icon: BarChart3 },
          { label: 'Pasaron', value: passed, sub: `${pct(passed)}%`, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Fallaron', value: failed, sub: `${pct(failed)}%`, color: 'text-rose-700', bg: 'bg-rose-50', icon: XCircle },
          { label: 'Pendientes', value: pending, sub: `${pct(pending)}%`, color: 'text-slate-600', bg: 'bg-slate-50', icon: Clock }
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{c.label}</span>
                <span className={cn('rounded-md p-1.5', c.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', c.color)} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={cn('text-2xl font-bold', c.color)}>{c.value}</span>
                {c.sub && <span className="text-xs text-slate-400">{c.sub}</span>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Distribución por módulo</h3>
        <div className="space-y-2">
          {groupsOrder.map((g) => {
            const count = items.filter((i) => i.currentGroup === g).length
            const w = total === 0 ? 0 : (count / total) * 100
            return (
              <div key={g}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{g}</span>
                  <span className="text-slate-400">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-all', GROUP_COLORS[g] ?? 'bg-slate-400')}
                    style={{ width: `${w}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   7. INTEGRATION HUB (mock)
   ────────────────────────────────────────────────────────────────────────── */
const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', icon: Hash, desc: 'Notifica al canal #qa-bugs al detectar fallos', status: 'Conectado' },
  { id: 'github', name: 'GitHub', icon: Code2, desc: 'Crea issues automáticamente desde Bugs Activos', status: 'Conectado' },
  { id: 'gmail', name: 'Gmail', icon: Mail, desc: 'Envía resumen diario al líder de QA', status: 'Inactivo' },
  { id: 'n8n', name: 'n8n', icon: Workflow, desc: 'Webhook a /flotilla/qa/bug para automatizaciones', status: 'Conectado' }
]

const IntegrationsPanel = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      <Link2 className="h-4 w-4 text-slate-500" />
      <h3 className="text-sm font-semibold text-slate-800">Hub de integración</h3>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {INTEGRATIONS.map((it) => {
        const Icon = it.icon
        const on = it.status === 'Conectado'
        return (
          <div key={it.id} className="rounded-lg border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{it.name}</span>
              </div>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                on ? 'bg-emerald-500' : 'bg-slate-300'
              )} />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{it.desc}</p>
          </div>
        )
      })}
    </div>
  </div>
)

/* ──────────────────────────────────────────────────────────────────────────
   8. AUTOMATION RULE BANNER (visual feedback de la regla)
   ────────────────────────────────────────────────────────────────────────── */
const AutomationBanner = () => (
  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
    <Zap className="h-3.5 w-3.5 text-amber-600" />
    <span>
      <strong className="font-semibold">Regla activa:</strong>{' '}
      si una prueba cambia a <em>Falló ❌</em>, se mueve automáticamente a{' '}
      <span className="font-semibold">Bugs Activos</span>. Si vuelve a{' '}
      <em>Pasó ✔️</em> o <em>Sin Iniciar</em>, regresa a su módulo original.
    </span>
  </div>
)

/* ──────────────────────────────────────────────────────────────────────────
   8b. MODAL: Nuevo stage (con portal para no romperse con overflow)
   ────────────────────────────────────────────────────────────────────────── */
const NewStageModal = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState(STAGE_COLOR_PALETTE[0].class)

  useEffect(() => {
    if (open) { setName(''); setColor(STAGE_COLOR_PALETTE[0].class) }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate({ name: trimmed, color })
    onClose()
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1100] bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-stage-title"
        className="fixed left-1/2 top-1/2 z-[1101] w-[420px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="new-stage-title" className="text-base font-semibold text-slate-900">
              Nuevo stage
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Crea un grupo para agrupar casos de prueba (ej. "Módulo: Reportes").
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="stage-name" className="mb-1 block text-xs font-medium text-slate-700">
              Nombre del stage
            </label>
            <input
              id="stage-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              placeholder="Módulo: Reportes"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-700">Color</span>
            <div className="flex flex-wrap gap-2">
              {STAGE_COLOR_PALETTE.map((c) => {
                const active = c.class === color
                return (
                  <button
                    key={c.class}
                    type="button"
                    onClick={() => setColor(c.class)}
                    title={c.name}
                    className={cn(
                      'h-7 w-7 rounded-full transition-transform',
                      c.class,
                      active ? 'ring-2 ring-offset-2 ring-slate-700 scale-110' : 'hover:scale-110'
                    )}
                    aria-label={`Color ${c.name}`}
                  />
                )
              })}
            </div>
          </div>

          {/* preview */}
          <div className="rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
              <span className="text-xs font-semibold text-slate-700">
                {name.trim() || 'Vista previa'}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                0 elementos
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#3f51b5] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#3f51b5]/90 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear stage
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   9. APP PRINCIPAL
   ────────────────────────────────────────────────────────────────────────── */
const VIEWS = [
  { id: 'kanban', label: 'Tablero', icon: LayoutGrid },
  { id: 'table', label: 'Tabla', icon: TableIcon },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
]

const QABoard = () => {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [view, setView] = useState('kanban')
  const [query, setQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('Todas')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [toast, setToast] = useState(null)

  // Stages dinámicos
  const [groupsOrder, setGroupsOrder] = useState(GROUPS_ORDER)
  const [groupColors, setGroupColors] = useState(GROUP_COLORS)
  const [newStageOpen, setNewStageOpen] = useState(false)
  const [activeNewJobStage, setActiveNewJobStage] = useState(null) // nombre del stage con form abierto

  // Motor de automatización
  const handleStatusChange = useCallback((id, newStatus) => {
    setItems((prev) => {
      const updated = prev.map((it) => (it.id === id ? automationRule(it, newStatus) : it))
      return updated
    })

    // micro-interacción: toast con explicación del movimiento
    const item = items.find((i) => i.id === id)
    if (item && item.status !== newStatus) {
      const movedTo = newStatus === STATUS.FALLÓ ? 'Bugs Activos' : item.originalGroup
      const icon = newStatus === STATUS.FALLÓ ? Bug : newStatus === STATUS.PASÓ ? CheckCircle2 : Clock
      const tone = newStatus === STATUS.FALLÓ ? 'rose' : newStatus === STATUS.PASÓ ? 'emerald' : 'slate'
      setToast({
        id: Date.now(),
        text: `«${item.name}» → ${movedTo}`,
        icon,
        tone
      })
    }
  }, [items])

  // Mover manualmente un item a otro stage (no automático)
  const handleChangeGroup = useCallback((id, newGroup) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, currentGroup: newGroup } : it)))
    const item = items.find((i) => i.id === id)
    if (item && item.currentGroup !== newGroup) {
      setToast({
        id: Date.now(),
        text: `«${item.name}» → ${newGroup}`,
        icon: GitBranch,
        tone: 'emerald'
      })
    }
  }, [items])

  // Reordenar dentro del mismo stage (drag & drop)
  const handleReorderItem = useCallback((activeId, overId) => {
    setItems((prev) => {
      const fromIdx = prev.findIndex((i) => i.id === activeId)
      const toIdx = prev.findIndex((i) => i.id === overId)
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev
      const next = prev.slice()
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  // Crear job (test) — soporta payload completo o defaults
  const handleAddItem = useCallback((groupName, payload) => {
    const id = `qa-${Math.random().toString(36).slice(2, 8)}`
    const newItem = {
      id,
      name: payload?.name ?? 'Nueva prueba manual',
      section: payload?.section ?? 'Global/UI',
      device: payload?.device ?? 'Chrome Desktop',
      status: STATUS.PENDIENTE,
      severity: payload?.severity ?? 'Baja',
      delivery_date: payload?.delivery_date ?? new Date().toISOString().slice(0, 10),
      originalGroup: groupName,
      currentGroup: groupName
    }
    setItems((prev) => [...prev, newItem])
    setToast({
      id: Date.now(),
      text: `Job «${newItem.name}» creado en ${groupName}`,
      icon: CheckCircle2,
      tone: 'emerald'
    })
  }, [])

  // Crear stage
  const handleCreateStage = useCallback(({ name, color }) => {
    setGroupsOrder((prev) => [...prev, name])
    setGroupColors((prev) => ({ ...prev, [name]: color }))
    setToast({
      id: Date.now(),
      text: `Stage «${name}» creado`,
      icon: GitBranch,
      tone: 'emerald'
    })
  }, [])

  // Borrar stage — si tiene items, también se mueven a Bugs Activos
  const handleDeleteStage = useCallback((stageName) => {
    if (stageName === 'Bugs Activos') {
      setToast({ id: Date.now(), text: 'Bugs Activos no se puede eliminar', icon: XCircle, tone: 'rose' })
      return
    }
    setItems((prev) =>
      prev.map((it) =>
        it.currentGroup === stageName
          ? { ...it, currentGroup: 'Bugs Activos' }
          : it
      )
    )
    setGroupsOrder((prev) => prev.filter((g) => g !== stageName))
    setGroupColors((prev) => {
      const next = { ...prev }
      delete next[stageName]
      return next
    })
    setToast({
      id: Date.now(),
      text: `Stage «${stageName}» eliminado (sus jobs fueron a Bugs Activos)`,
      icon: Trash2,
      tone: 'slate'
    })
  }, [])

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  // filtrado (alimenta tabla, calendario, dashboard)
  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (severityFilter !== 'Todas' && i.severity !== severityFilter) return false
      if (dateFrom && (!i.delivery_date || i.delivery_date < dateFrom)) return false
      if (dateTo && (!i.delivery_date || i.delivery_date > dateTo)) return false
      if (query.trim()) {
        const t = query.toLowerCase()
        const hay = `${i.name} ${i.section} ${i.device} ${i.currentGroup}`.toLowerCase()
        if (!hay.includes(t)) return false
      }
      return true
    })
  }, [items, query, severityFilter, dateFrom, dateTo])

  const dateFilterActive = Boolean(dateFrom || dateTo)
  const clearDateFilter = () => { setDateFrom(''); setDateTo('') }

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3f51b5] text-sm font-bold text-white shadow-sm">
              IT
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                QA Manual — Mi App en React
              </h1>
              <p className="text-xs text-slate-500">
                Tablero de pruebas manuales · {items.length} casos totales · {groupsOrder.length} stages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Bell className="h-3.5 w-3.5" />
              Notificaciones
            </button>
            <button
              type="button"
              onClick={() => setNewStageOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#3f51b5] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f51b5]/90"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Nuevo stage
            </button>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="mx-auto max-w-7xl space-y-3 px-6 py-4">
        <AutomationBanner />

        <div className="flex flex-wrap items-center gap-2">
          {/* Switcher de vista */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {VIEWS.map((v) => {
              const Icon = v.icon
              const active = view === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar caso, componente, módulo…"
                className="h-8 w-64 rounded-md border border-slate-200 bg-white px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>

            {/* Filtro por rango de fechas */}
            <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
              <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="h-6 w-[120px] bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                aria-label="Fecha desde"
                title="Fecha desde"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="h-6 w-[120px] bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                aria-label="Fecha hasta"
                title="Fecha hasta"
              />
              {dateFilterActive && (
                <button
                  type="button"
                  onClick={clearDateFilter}
                  className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Limpiar filtro de fechas"
                  title="Limpiar filtro de fechas"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none"
              >
                {['Todas', 'Baja', 'Media', 'Crítico'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <IntegrationsPanel />

        {/* Vistas dinámicas */}
        <div className="pt-1">
          {view === 'kanban' && (
            <KanbanView
              items={filtered}
              groupsOrder={groupsOrder}
              onStatusChange={handleStatusChange}
              onChangeGroup={handleChangeGroup}
              onReorderItem={handleReorderItem}
              onCreateJob={handleAddItem}
              onDeleteStage={handleDeleteStage}
              onAddStageClick={() => setNewStageOpen(true)}
              activeNewJobStage={activeNewJobStage}
              onOpenNewJobForm={(stageName) => setActiveNewJobStage(stageName)}
              onCancelNewJob={() => setActiveNewJobStage(null)}
            />
          )}
          {view === 'table' && (
            <TableView
              items={filtered}
              groupsOrder={groupsOrder}
              onStatusChange={handleStatusChange}
              onChangeGroup={handleChangeGroup}
            />
          )}
          {view === 'calendar' && <CalendarView items={filtered} />}
          {view === 'dashboard' && <DashboardView items={filtered} groupsOrder={groupsOrder} />}
        </div>
      </div>

      {/* MODAL: Nuevo stage */}
      <NewStageModal
        open={newStageOpen}
        onClose={() => setNewStageOpen(false)}
        onCreate={handleCreateStage}
      />

      {/* TOAST flotante */}
      {toast && (() => {
        const Icon = toast.icon
        const toneCls =
          toast.tone === 'rose' ? 'border-rose-200 bg-rose-50 text-rose-800' :
          toast.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
          'border-slate-200 bg-white text-slate-800'
        return (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div className={cn(
              'pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg transition-all',
              toneCls
            )}>
              <Icon className="h-3.5 w-3.5" />
              {toast.text}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default QABoard
