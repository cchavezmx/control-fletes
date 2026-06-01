import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import Select from 'react-select'
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

dayjs.locale('es')

const API = process.env.NEXT_PUBLIC_API

const schema = z.object({
  conductor: z.string().min(1, 'Campo requerido'),
  destino: z.string().min(1, 'Campo requerido'),
  modelo: z.string().min(1, 'Campo requerido'),
  placa: z.string().min(1, 'Campo requerido'),
  soat: z.string().optional(),
  tarjetaCirculacion: z.string().optional(),
  fechaSalida: z.string().min(1, 'Campo requerido'),
  fechaLlegada: z.string().optional(),
  kmSalida: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  kmLlegada: z.coerce.number().optional(),
  motivo: z.string().optional(),
  combustibleSalida: z.coerce.number().min(0).max(100).optional()
})

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: '#c4c4c4',
    boxShadow: 'none',
    '&:hover': { borderColor: '#888' }
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: 'white'
  })
}

export default function VehicleExitForm ({ vehicles = [] }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { combustibleSalida: 50 }
  })

  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const combustible = watch('combustibleSalida')
  const [loading, setLoading] = useState(false)

  const onSubmit = (data) => {
    setLoading(true)
    const formattedData = {
      ...data,
      fechaSalida: dayjs(data.fechaSalida).toDate(),
      fechaLlegada: data.fechaLlegada
        ? dayjs(data.fechaLlegada).toDate()
        : undefined
    }

    try {
      const url = `${API}/controlvh/create/vehicleExit`
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      }
      fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error en la solicitud')
          }
          return response.json()
        })
        .then((data) => {
          console.log('Respuesta del servidor:', data)
          toast.success('Salida registrada correctamente')
          reset()
          setLoading(false)
        })
        .catch((error) => {
          toast.error('Error al registrar la salida')
          console.error('Error al enviar el formulario:', error)
          setLoading(false)
        })
    } catch (error) {
      console.log('Formulario enviado:', formattedData)
    }
  }

  const handleDateChange = (field) => (value) => {
    setValue(field, value ? value?.toISOString() : '')
  }

  const vehicleOptions = vehicles.map((v) => ({
    value: v._id,
    label: `${v.placas} - ${v.modelo}`,
    data: v
  }))

  const handleVehicleChange = (selected) => {
    setSelectedVehicle(selected)
    const v = selected.data
    setValue('modelo', v.modelo || '')
    setValue('placa', v.placas || '')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">Gurdando Registro...</p>
      </div>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto p-6"
      >
        <h1 className="text-xl font-bold mb-4">Salida de Vehículo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['conductor', 'destino'].map((field) => (
            <input
              key={field}
              className={`w-full h-10 rounded-md border px-3 text-sm ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              {...register(field)}
            />
          ))}

          <div className="md:col-span-2">
            <p className="text-sm font-medium mb-2">Seleccionar Vehículo</p>
            <Select
              styles={customSelectStyles}
              options={vehicleOptions}
              value={selectedVehicle}
              onChange={handleVehicleChange}
              placeholder="Selecciona un vehículo"
            />
          </div>

          {['modelo', 'placa', 'soat', 'tarjetaCirculacion'].map((field) => (
            <input
              key={field}
              className={`w-full h-10 rounded-md border px-3 text-sm ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={watch(field) || ''}
              onChange={(e) => setValue(field, e.target.value)}
            />
          ))}

          <DatePicker
            label="Fecha salida"
            value={watch('fechaSalida') ? dayjs(watch('fechaSalida')) : null}
            onChange={handleDateChange('fechaSalida')}
            slotProps={{
              textField: {
                className: 'w-full',
                error: !!errors.fechaSalida,
                helperText: errors.fechaSalida?.message?.toString()
              }
            }}
          />

          <DatePicker
            label="Fecha llegada"
            value={watch('fechaLlegada') ? dayjs(watch('fechaLlegada')) : null}
            onChange={handleDateChange('fechaLlegada')}
            slotProps={{
              textField: {
                className: 'w-full'
              }
            }}
          />

          <input
            className={`w-full h-10 rounded-md border px-3 text-sm ${errors.kmSalida ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Kilometraje salida"
            type="number"
            {...register('kmSalida')}
          />

          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Kilometraje llegada"
            type="number"
            {...register('kmLlegada')}
          />
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Accesorios y Herramientas</p>
          <div className="flex flex-wrap gap-3">
            {[
              'Extintor',
              'Gato',
              'Llave de ruedas',
              'Herramientas',
              'Triángulo',
              'Botiquín',
              'Espejo lateral derecho',
              'Espejo lateral izquierdo',
              'Radio',
              'Antena'
            ].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(item)} />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Estado Carrocería</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Puertas', name: 'PuertasEstado' },
              { label: 'Pintura', name: 'PinturaEstado' },
              { label: 'Interiores', name: 'InterioresEstado' },
              { label: 'Cinturones', name: 'CinturonesEstado' }
            ].map(({ label, name }) => (
              <select
                key={name}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                value={watch(name) || ''}
                onChange={(e) => setValue(name, e.target.value)}
              >
                <option value="">{label}</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo</option>
              </select>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Combustible (Salida)</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Number(combustible)}
              onChange={(e) => setValue('combustibleSalida', Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-[#3f51b5]"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={combustible}
              onChange={(e) => setValue('combustibleSalida', Number(e.target.value))}
              className="w-20 h-10 rounded-md border border-gray-300 px-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px]"
            placeholder="Motivo de salida"
            {...register('motivo')}
          />
        </div>

        <div className="mt-6">
          <Button type="submit">Guardar salida</Button>
        </div>
      </form>
    </LocalizationProvider>
  )
}

export async function getServerSideProps (context) {
  const API = process.env.NEXT_PUBLIC_API
  const vehicles = await fetch(`${API}/flotilla/vehicles`)
    .then((res) => res.json())
    .then(({ vehicles }) => vehicles)

  return {
    props: {
      vehicles
    }
  }
}
