import { useState, useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X
} from 'lucide-react'
import { CENTROS_COSTO_URL } from '../../lib/catalogoCentrosCosto'

const fetcher = (url) => fetch(url).then((res) => res.json())

const normalizeId = (value) => {
  if (!value) return ''
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

const emptyForm = {
  id: '',
  name: '',
  active: true,
  order: 0
}

const CentrosCostoAdmin = () => {
  const { data: catalogo, isLoading } = useSWR(CENTROS_COSTO_URL, fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    refreshInterval: 0
  })

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const items = useMemo(() => {
    if (!catalogo || catalogo.status !== 'success' || !Array.isArray(catalogo.data)) return []
    return [...catalogo.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [catalogo])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, order: items.length })
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
    setForm(emptyForm)
  }

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !editing) {
        next.id = normalizeId(value)
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
      const url = isCreate
        ? CENTROS_COSTO_URL
        : `${CENTROS_COSTO_URL}/${editing.id}`
      const method = isCreate ? 'POST' : 'PUT'

      const payload = isCreate
        ? {
            id: form.id || normalizeId(form.name),
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

      if (!res.ok) {
        throw new Error(result.message || `Error ${res.status}`)
      }

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

    const updates = newItems.map((item, i) => ({ ...item, order: i }))

    try {
      await Promise.all(
        updates.map((item) =>
          fetch(`${CENTROS_COSTO_URL}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: item.order })
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Centros de costo</h1>
          <p className="text-sm text-muted-foreground">
            Administra las opciones que aparecen en el wizard de documentos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo centro
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Orden</th>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Cargando catálogo…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No hay centros de costo registrados.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className={item.active === false ? 'bg-muted/50' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs w-5">{item.order ?? 0}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.active === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {item.active === false ? (
                        <><X className="h-3 w-3" /> Inactivo</>
                      ) : (
                        <><Check className="h-3 w-3" /> Activo</>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteItem(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
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
            <DialogTitle>
              {editing ? 'Editar centro de costo' : 'Nuevo centro de costo'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Cambia el nombre, el estado o el orden de la opción.'
                : 'Crea una opción que estará disponible en el wizard de documentos.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveItem} className="space-y-4 py-4">
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
                  Se guarda en el campo <code>cost_center</code> de los documentos. Solo minúsculas, números y guiones bajos.
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
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CentrosCostoAdmin
