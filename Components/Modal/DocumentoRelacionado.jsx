/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useMemo, useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import NewVehicle from './NewVehicle'
import NewPlan from './NewPlan'

const API = process.env.NEXT_PUBLIC_API

const DocumentoRelacionado = ({ open, close, empresaId, refreshData, listVehicles = [], prevData }) => {
  const [type, setType] = useState('')
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      ...prevData
    }
  })
  const [saveData, setSaveData] = useState(false)

  const dateRequest = watch('request_date')
  const dateDelivery = watch('delivery_date')
  const planWatchSelected = watch('plan')

  const [vehicleSelected, setVehicleSelected] = useState('')
  const [openNewVehicle, setOpenNewVehicle] = useState(false)
  const handledNewVehicle = (event) => setOpenNewVehicle(event)

  const getVehicleBySlug = async (slug) => {
    const response = await fetch(`${API}/flotilla/planes/slug/${slug}`)
      .then(res => res.json())
      .then(({ planes }) => planes)
    return response
  }

  const [planByVehicle, setPlanByVehicle] = useState([])
  useEffect(() => {
    if (vehicleSelected) {
      getVehicleBySlug(vehicleSelected)
        .then(planes => {
          setPlanByVehicle(planes)
        })
    }
  }, [vehicleSelected])

  const getIdVehicle = useMemo(() => {
    if (vehicleSelected) {
      const vehicle = listVehicles?.find(item => item.placas === vehicleSelected)
      return vehicle?._id
    }
  }, [vehicleSelected])

  const [newPlan, setNewPlan] = useState(false)
  const handledNewPlan = (event) => setNewPlan(event)

  const selectVehicles = () => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Lista de unidades</label>
        <select
          className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
          value={vehicleSelected}
          onChange={(e) => setVehicleSelected(e.target.value)}
        >
          <option onClick={() => handledNewVehicle(true)} value="">Agregar nueva unidad 🚛</option>
          {
            listVehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle.placas}>{`${vehicle.placas} - ${vehicle.modelo}`}</option>
            ))
          }
        </select>
      </div>
    )
  }

  const handleClose = () => {
    close()
    reset()
    setType('')
    setVehicleSelected('')
  }

  const onSubmit = async (data) => {
    if (!vehicleSelected) {
      toast.error('Selecciona un vehiculo')
      return
    }
    if (!type) {
      toast.info('Selecciona un tipo de documento')
      return
    }

    setSaveData(true)
    const planSelected = planByVehicle.find(item => item._id === planWatchSelected)
    const payload = {
      ...data,
      description: planSelected,
      vehicle: vehicleSelected,
      bussiness_cost: empresaId
    }
    await fetch(`${API}/flotilla/insert?type=${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .catch(err => {
        toast.error(err.message)
        setSaveData(false)
      })
      .finally(res => {
        toast.success('Documento guardado')
        setSaveData(false)
        refreshData()
        handleClose()
      })
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="left" className="w-full max-w-[400px] overflow-y-auto bg-[#FBFCDD]">
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Tipo de documento</label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Selecciona...</option>
                <option value="traslado">Traslado</option>
                <option value="flete">Flete</option>
                <option value="renta">Renta</option>
              </select>
            </div>

            {selectVehicles()}

            {vehicleSelected && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Elige tu plan</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                  {...register('plan', { required: true })}
                >
                  <option onClick={() => handledNewPlan(true)} value="">Agregar nuevo plan 🚛</option>
                  {
                    planByVehicle.length > 0
                      ? planByVehicle.map(plan => <option key={plan._id} value={plan._id}>{`${plan.planName} - $${plan.planPrice} PESOS`}</option>)
                      : <option value="">No hay planes</option>
                  }
                </select>
              </div>
            )}

            <input
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
              type="date"
              value={dateRequest ? dayjs(dateRequest).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}
              {...register('request_date', { required: true })}
            />
            {errors.request_date && <span className="text-xs text-red-600">Este campo es obligatorio</span>}

            <input
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
              type="date"
              value={dateDelivery ? dayjs(dateDelivery).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}
              {...register('delivery_date', { required: true })}
            />
            {errors.delivery_date && <span className="text-xs text-red-600">Este campo es obligatorio</span>}

            {['conductor', 'ruta', 'kilometer_out', 'kilometer_in', 'fuel_level', 'document_id', 'project_id', 'fuel_card'].map((field) => (
              <input
                key={field}
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                type={field.includes('kilometer') || field === 'fuel_level' ? 'number' : 'text'}
                {...register(field)}
              />
            ))}

            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px]"
              placeholder="Observaciones"
              {...register('observations')}
            />
          </div>

          <div className="flex gap-4 justify-center mt-2">
            <Button type="submit" disabled={saveData}>Guardar</Button>
            <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
          </div>
        </form>

        <NewVehicle
          open={openNewVehicle}
          close={handledNewVehicle}
          empresaId={empresaId}
          chivato={refreshData}
        />
        <NewPlan
          open={newPlan}
          close={handledNewPlan}
          vehicleID={getIdVehicle}
          setPlanByVehicle={setPlanByVehicle}
        />
      </SheetContent>
    </Sheet>
  )
}

export default DocumentoRelacionado
