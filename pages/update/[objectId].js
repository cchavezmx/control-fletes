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

  const { register, handleSubmit, watch } = useForm({
    defaultValues: currentModel
  })

  const dateRequest = watch('request_date')
  const dateDelivery = watch('delivery_date')

  const getDateLoco = (date) => {
    if (dateRequest !== currentModel.request_date) {
      return dayjs(date).format('YYYY-MM-DD')
    } else {
      return dayjs(date).add(1, 'day').format('YYYY-MM-DD')
    }
  }

  const [saveData, setSaveData] = useState(false)
  const [clientData, setClientData] = useState(currentModel.client)
  const updateOrderSubmit = async (data) => {
    setSaveData(true)
    await fetch(`${API}/flotilla/update/${objectId}?type=${type.toLowerCase()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.message._id) {
          toast.success('Actualizado')
          setTimeout(() => {
            router.push(`/${currentModel.bussiness_cost}`)
          }, 3000)
        } else {
          toast.error(res.message)
        }
      })
      .finally(() => {
        setSaveData(false)
      })
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
            value={getDateLoco(dateRequest)}
            {...register('request_date', { required: true })}
          />
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            type="date"
            value={getDateLoco(dateDelivery)}
            {...register('delivery_date', { required: true })}
          />

          <select
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
            {...register('client', { required: true })}
            onChange={(e) => setClientData(e.target.value)}
            value={EMPRESAS.find(empresa => empresa._id === clientData)?._id || ''}
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
  const currentModel = await fetch(`${API}/flotilla/get/${objectId}?type=${type.toLowerCase()}`)
    .then(res => res.json())
    .then(({ [type.toLowerCase()]: currentModel }) => currentModel)

  return {
    props: {
      type,
      objectId,
      currentEmpresa,
      currentModel
    }
  }
}

export default UpdateModel
