import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { LoadScript, Autocomplete } from '@react-google-maps/api'
import bussines from '../../utils/catalogov2.bussinesses.json'
import { carriers } from './data'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import z from 'zod'
const API = process.env.NEXT_PUBLIC_API

const schemaForm = z.object({
  proyecto: z.string().min(3),
  paqueteria: z.string().min(3),
  direccion: z.string().min(3),
  contacto: z.string().min(3),
  numeroContacto: z.string().min(3),
  empresaEnvio: z.string().min(3),
  contacto_recibe: z.string().min(3),
  numeroContacto_recibe: z.string().min(3),
  emailContacto: z.string().email(),
  contacto_recibe_email: z.string().email()
})

const validPostalCode = (value) => {
  const regex = /\b\d{5}\b/
  return regex.test(value)
}

const FormularioConAutocomplete = () => {
  const { control, handleSubmit, setValue } = useForm()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [idResponse, setIdResponse] = useState('')

  const autocompleteRef = React.useRef(null)
  const saveData = async (data) => {
    const r = '/paqueteria'
    const response = await fetch(API + r, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      toast.success('Datos enviados correctamente')
      return response.json()
    } else {
      toast.error('Error al enviar los datos')
    }
  }

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace()
    const formattedAddress = place?.formatted_address || ''
    setAddress(formattedAddress)
    setValue('direccion', formattedAddress)
  }

  const onSubmit = async (data) => {
    setError({})
    const result = schemaForm.safeParse(data)
    if (!result.success) {
      toast.error('Error en los datos enviados')
      Object.entries(result.error).forEach(([key, value]) => {
        if (key === 'issues') {
          value.forEach((issue) => {
            setError((prev) => ({ ...prev, [issue.path[0]]: issue.message }))
          })
        }
      })
      return
    }

    if (!validPostalCode(data.direccion)) {
      toast.error(
        'Parece que la dirección no está bien escrita, por favor verifica que contenga calle y número'
      )
      return
    }

    const doc = await saveData(data)
    setIdResponse(doc.success_id)
    setValue('proyecto', '')
    setValue('paqueteria', '')
    setValue('direccion', '')
    setValue('contacto', '')
    setValue('numeroContacto', '')
    setValue('empresaEnvio', '')
    setValue('contacto_recibe', '')
    setValue('numeroContacto_recibe', '')
    setValue('emailContacto', '')
    setValue('contacto_recibe_email', '')
    setAddress('')
  }

  return (
    <div className="mt-8">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
        libraries={['places']}
      >
        {idResponse && (
          <div>
            <h2>Folio interno de envio</h2>
            <p>Id de respuesta: {idResponse}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="px-4">
          <div className="flex flex-col gap-3 shadow-sm border rounded p-4 mt-2">
            <p className="text-xs text-muted-foreground">Información de proyecto</p>
            <Controller
              name="proyecto"
              control={control}
              defaultValue=""
              render={({ field: { onChange, ...restField } }) => (
                <input
                  {...restField}
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.proyecto ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Proyecto u Obra"
                  onChange={(e) => onChange(e.target.value.toUpperCase())}
                />
              )}
            />

            <Controller
              name="paqueteria"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full h-10 rounded-md border bg-white px-2 text-sm ${error.paqueteria ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Servicio de Paquetería</option>
                  {carriers.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              )}
            />

            <label className="block mt-4 mb-2 text-base">Dirección de Entrega</label>
            <Autocomplete
              size="small"
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Escribe tu dirección"
                className="w-full p-2.5 text-base border border-gray-300 rounded mb-4"
              />
            </Autocomplete>

            <Controller
              name="direccion"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="hidden"
                  value={address}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-3 shadow-sm border rounded p-4 mt-2">
            <p className="text-xs text-muted-foreground">Información de contacto de Remitente</p>
            <Controller
              name="contacto"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.contacto ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nombre del que envía"
                />
              )}
            />
            <Controller
              name="emailContacto"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  required
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.contacto ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Correo del que envía"
                />
              )}
            />
            <Controller
              name="numeroContacto"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.numeroContacto ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Número del que envía"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-3 shadow-sm border rounded p-4 mt-2">
            <p className="text-xs text-muted-foreground">Información de contacto Destino</p>
            <Controller
              name="contacto_recibe"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.contacto_recibe ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nombre del que recibe"
                />
              )}
            />
            <p className="text-xs text-muted-foreground">Número de que recibe</p>
            <Controller
              name="numeroContacto_recibe"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.numeroContacto_recibe ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Número del que recibe"
                />
              )}
            />
            <Controller
              name="contacto_recibe_email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  required
                  className={`w-full h-10 rounded-md border px-3 text-sm ${error.numeroContacto_recibe ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Correo del que recibe"
                />
              )}
            />
          </div>

          <Controller
            name="empresaEnvio"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <select
                {...field}
                className={`w-full h-10 rounded-md border bg-white px-2 text-sm mt-4 ${error.empresaEnvio ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Empresa que envía</option>
                {bussines.map((option) => (
                  <option key={option._id.$oid} value={option._id.$oid}>{option.name}</option>
                ))}
              </select>
            )}
          />

          <div className="mt-4 mb-4">
            <Button type="submit">Enviar</Button>
          </div>
        </form>
      </LoadScript>
    </div>
  )
}

export default FormularioConAutocomplete
