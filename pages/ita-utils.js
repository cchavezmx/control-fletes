import { useEffect, useState, useRef } from 'react'
import useSWR, { mutate } from 'swr'
import { getUrlByName, addFile } from '../firebase/client'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { getStoredRates, setStoredRates, DEFAULT_RATES } from '../utils/costBreakdown'
import { CENTROS_COSTO_URL, normalizeCostCenterId } from '../lib/catalogoCentrosCosto'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Upload,
  Percent,
  Tags,
  FileText
} from 'lucide-react'

const cleanDecimal = (v) => String(v ?? '').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')

const fetcher = (url) => fetch(url).then((res) => res.json())

const RateInput = ({ label, defaultValue, inputRef }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">{label}</label>
    <input
      type="text"
      inputMode="decimal"
      className="w-full h-10 rounded-md border border-gray-300 px-2 text-sm"
      defaultValue={defaultValue}
      ref={inputRef}
      onChange={(e) => {
        e.target.value = cleanDecimal(e.target.value)
      }}
    />
  </div>
)

const SectionCard = ({ title, description, icon: Icon, children }) => (
  <details className="border rounded-xl mb-4 bg-white shadow-sm group">
    <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#3f51b5]/10 flex items-center justify-center text-[#3f51b5]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <span className="font-semibold block">{title}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
      </div>
      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
    </summary>
    <div className="p-4 border-t">
      {children}
    </div>
  </details>
)

const CostCentersAdmin = () => {
  const { data: catalogo, isLoading } = useSWR(CENTROS_COSTO_URL, fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    refreshInterval: 0
  })

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ id: '', name: '', active: true, order: 0 })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const items = catalogo?.status === 'success' && Array.isArray(catalogo.data)
    ? [...catalogo.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : []

  const openCreate = () => {
    setEditing(null)
    setForm({ id: '', name: '', active: true, order: items.length })
    setIsOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      id: item.id,
      name: item.name,
      active: item.active !== false,
      order: item.order ?? 0
    })
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setEditing(null)
    setForm({ id: '', name: '', active: true, order: 0 })
  }

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !editing) {
        next.id = normalizeCostCenterId(value)
      }
      return next
    })
  }

  const saveItem = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    setSaving(true)
    try {
      const isCreate = !editing
      const url = isCreate ? CENTROS_COSTO_URL : `${CENTROS_COSTO_URL}/${editing.id}`
      const method = isCreate ? 'POST' : 'PUT'
      const payload = isCreate
        ? {
            id: form.id || normalizeCostCenterId(form.name),
            name: form.name.trim(),
            active: form.active,
            order: Number(form.order) || 0
          }
        : {
            name: form.name.trim(),
            active: form.active,
            order: Number(form.order) || 0
          }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.message || `Error ${res.status}`)

      await mutate(CENTROS_COSTO_URL)
      toast.success(isCreate ? 'Centro de costo creado' : 'Centro de costo actualizado')
      closeDialog()
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item) => {
    try {
      const res = await fetch(`${CENTROS_COSTO_URL}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: item.active === false })
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.message || `Error ${res.status}`)

      await mutate(CENTROS_COSTO_URL)
      toast.success(item.active === false ? 'Centro de costo activado' : 'Centro de costo desactivado')
    } catch (err) {
      toast.error(err.message || 'No se pudo cambiar el estado')
    }
  }

  const deleteItem = async (id) => {
    if (!window.confirm(`¿Eliminar el centro de costo "${id}"?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`${CENTROS_COSTO_URL}/${id}`, { method: 'DELETE' })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.message || `Error ${res.status}`)

      await mutate(CENTROS_COSTO_URL)
      toast.success('Centro de costo eliminado')
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    const [moved] = newItems.splice(index, 1)
    newItems.splice(targetIndex, 0, moved)

    try {
      await Promise.all(
        newItems.map((item, i) =>
          fetch(`${CENTROS_COSTO_URL}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: i })
          })
        )
      )
      await mutate(CENTROS_COSTO_URL)
      toast.success('Orden actualizado')
    } catch (err) {
      toast.error('No se pudo actualizar el orden')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Centros de costo</h3>
          <p className="text-sm text-muted-foreground">
            Opciones que aparecen en el wizard de documentos.
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo centro
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Orden</th>
              <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">ID</th>
              <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Nombre</th>
              <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Estado</th>
              <th className="px-3 py-2 text-right font-medium text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Cargando catálogo…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  No hay centros de costo registrados.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className={item.active === false ? 'bg-muted/40' : ''}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-0.5">
                      <span className="font-mono text-xs w-4">{item.order ?? 0}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.id}</td>
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.active === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {item.active === false ? <><X className="h-3 w-3" /> Inactivo</> : <><Check className="h-3 w-3" /> Activo</>}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteItem(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar centro de costo' : 'Nuevo centro de costo'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Cambia el nombre, el estado o el orden de la opción.'
                : 'Crea una opción que estará disponible en el wizard de documentos.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveItem} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej. Logística"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                autoFocus
              />
            </div>
            {!editing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">ID técnico</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => handleChange('id', e.target.value)}
                  placeholder="logistica"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Se guarda en el campo <code>cost_center</code> de los documentos.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Orden</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => handleChange('order', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <select
                  value={form.active ? 'true' : 'false'}
                  onChange={(e) => handleChange('active', e.target.value === 'true')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

const ItaUtils = () => {
  const [catalogo, setCatalogo] = useState('')
  const [currentURL, setCurrentURL] = useState('')
  const [file, setFile] = useState(null)
  const [rates, setRates] = useState(DEFAULT_RATES)

  const profitRef = useRef(null)
  const indirectRef = useRef(null)
  const ivaRef = useRef(null)
  const catalogRef = useRef(null)

  useEffect(() => {
    const stored = getStoredRates()
    setRates(stored)
  }, [])

  const handleChange = (event) => {
    event.preventDefault()
    setCatalogo(event.target.value)
  }

  useEffect(() => {
    const getURL = async () => {
      const url = await getUrlByName(catalogo)
      setCurrentURL(url)
    }
    getURL()
  }, [catalogo, currentURL])

  const actualizarPDF = (event) => {
    event.preventDefault()
    addFile(file, catalogo).then((res) => {
      toast.success(res)
      setCatalogo('')
      if (catalogRef.current) catalogRef.current.value = ''
      setFile(null)
    })
  }

  const saveRates = (event) => {
    event.preventDefault()
    const next = {
      profit_pct: Number(profitRef.current?.value ?? DEFAULT_RATES.profit_pct),
      indirect_pct: Number(indirectRef.current?.value ?? DEFAULT_RATES.indirect_pct),
      iva_rate: Number(ivaRef.current?.value ?? DEFAULT_RATES.iva_rate) / 100
    }
    setRates(next)
    setStoredRates(next)
    toast.success('Márgenes e impuestos actualizados')
  }

  const resetRates = (event) => {
    event.preventDefault()
    setRates(DEFAULT_RATES)
    setStoredRates(DEFAULT_RATES)
    if (profitRef.current) profitRef.current.value = DEFAULT_RATES.profit_pct
    if (indirectRef.current) indirectRef.current.value = DEFAULT_RATES.indirect_pct
    if (ivaRef.current) ivaRef.current.value = DEFAULT_RATES.iva_rate * 100
    toast.success('Márgenes e impuestos restablecidos')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra catálogos, porcentajes y opciones del sistema.
        </p>
      </div>

      <SectionCard
        title="Catálogos de proveedores"
        description="Actualiza el PDF de catálogo que se muestra en la página web."
        icon={FileText}
      >
        <form className="flex flex-col items-center">
          <div className="flex flex-col gap-3 w-full max-w-[700px] py-2">
            <label className="text-sm font-medium">Catálogo</label>
            <select
              ref={catalogRef}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
              defaultValue=""
              onChange={handleChange}
            >
              <option value="">Selecciona...</option>
              <option value={'abb-catalogo'}>ABB</option>
              <option value={'canalizacion-catalogo'}>Canalización</option>
              <option value={'onka-catalogo'}>Onka</option>
            </select>

            <div className="flex justify-center">
              {catalogo && currentURL && (
                <a href={currentURL} target="_blank" rel="noreferrer">
                  <Button variant="outline">Link actual</Button>
                </a>
              )}
            </div>

            <label className="text-sm font-medium">Selecciona un archivo</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {file ? file.name : 'PDF del catálogo'}
                </span>
                <input
                  type="file"
                  disabled={!catalogo}
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file.type === 'application/pdf') {
                      setFile(file)
                    } else {
                      return toast.error('El archivo debe ser un PDF')
                    }
                  }}
                  className="hidden"
                />
              </label>
              <Button onClick={actualizarPDF} disabled={!file} type="submit">
                Actualizar
              </Button>
            </div>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Márgenes e impuestos"
        description="Porcentajes por defecto del wizard de documentos."
        icon={Percent}
      >
        <form className="flex flex-col items-center" onSubmit={saveRates}>
          <div className="flex flex-col gap-4 w-full max-w-[700px] py-2">
            <p className="text-sm text-muted-foreground">
              Estos valores se cargan por defecto al crear un nuevo documento y afectan el cálculo del PDF.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RateInput label="Utilidad (%)" defaultValue={rates.profit_pct} inputRef={profitRef} />
              <RateInput label="Indirectos (%)" defaultValue={rates.indirect_pct} inputRef={indirectRef} />
              <RateInput label="IVA (%)" defaultValue={rates.iva_rate * 100} inputRef={ivaRef} />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetRates}>
                Restablecer
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Centros de costo"
        description="Opciones del select del wizard de documentos."
        icon={Tags}
      >
        <CostCentersAdmin />
      </SectionCard>
    </div>
  )
}

export default ItaUtils
