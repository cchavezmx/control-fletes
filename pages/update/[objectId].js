import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import EMPRESAS from '../../lib/empresas.json'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
const API = process.env.NEXT_PUBLIC_API

const UpdateModel = ({ type, objectId, currentModel, currentEmpresa }) => {
  const router = useRouter()

  const fmtDay = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '')

  const { register, handleSubmit } = useForm({
    defaultValues: {
      ...currentModel,
      request_date: fmtDay(currentModel?.request_date),
      delivery_date: fmtDay(currentModel?.delivery_date)
    }
  })

  const [saveData, setSaveData] = useState(false)

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
        toast.success('Actualizado')
        setTimeout(() => {
          router.push(`/${currentModel.bussiness_cost}`)
        }, 1500)
      } else {
        toast.error(typeof result?.message === 'string' ? result.message : 'No se pudo actualizar')
      }
    } catch (err) {
      toast.error(err.message || 'No se pudo actualizar')
    } finally {
      setSaveData(false)
    }
  }

  return (
    <div>
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold">{currentEmpresa}</h1>
        <h2 className="text-xl font-semibold">
          Modificación <span className="bg-yellow-300 px-1 inline">{type}</span> Folio {currentModel.folio}
        </h2>
        <p className="text-xs text-muted-foreground">El tipo de documento y el folio no se pueden actualizar</p>
      </div>

      <form
        onSubmit={handleSubmit(updateOrderSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4"
      >
        <div className="flex flex-col gap-4 w-full">
          {[
            { name: 'subject', label: 'Asunto del documento', type: 'string' },
            { name: 'driver', label: 'Conductor' },
            { name: 'route', label: 'Ruta' },
            { name: 'recorrido_km', label: 'Recorrido (Km)' },
            { name: 'subtotal_travel', label: `Subtotal ${type.toUpperCase()}`, type: 'text' },
            { name: 'fuel_level', label: 'Nivel de combustible %', type: 'number' },
            { name: 'document_id', label: 'Salida de almacén (ADMIN/COMERCIAL)' },
            { name: 'project_id', label: 'Folio proyecto' },
            { name: 'fuel_card', label: 'Número de tarjeta de combustible' },
            { name: 'fuel_amount', label: 'Carga de combustible' },
            { name: 'link_googlemaps', label: 'Link Google Maps' }
          ].map((field) => (
            <input
              key={field.name}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
              placeholder={field.label}
              type={field.type || 'text'}
              {...register(field.name)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            type="date"
            {...register('request_date', { required: true })}
          />
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            type="date"
            {...register('delivery_date', { required: true })}
          />

          <select
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
            {...register('client', { required: true })}
          >
            {EMPRESAS.map(empresa => (
              <option key={empresa._id} value={empresa._id}>{empresa.name}</option>
            ))}
          </select>

          {currentModel.casetas && (
            <>
              <Separator />
              <p className="text-sm font-medium">Información de casetas</p>
              <div className="flex flex-col gap-2">
                <input
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                  placeholder="Costo total"
                  {...register('casetas')}
                />
                <input
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                  placeholder="TARJETA / BANCO / NOMBRE"
                  {...register('tarjeta_deposito')}
                />
              </div>
              <Separator />
            </>
          )}

          <div className="flex gap-4 justify-center mt-2">
            <Button type="submit" disabled={saveData}>Guardar</Button>
            <Button variant="outline" onClick={() => router.push(`/${currentModel.bussiness_cost}`)}>Regresar</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export async function getServerSideProps (context) {
  const { type, currentEmpresa } = context.query
  const { objectId } = context.params

  if (!type) return { notFound: true }

  const lowerType = type.toLowerCase()
  const currentModel = await fetch(`${API}/flotilla/get/${objectId}?type=${lowerType}`)
    .then(res => (res.ok ? res.json() : null))
    .then(data => data?.[lowerType] ?? null)
    .catch(() => null)

  if (!currentModel) return { notFound: true }

  return {
    props: {
      type,
      objectId,
      currentEmpresa: currentEmpresa ?? '',
      currentModel
    }
  }
}

export default UpdateModel
