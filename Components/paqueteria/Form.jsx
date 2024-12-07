import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Stack, TextField, Button, MenuItem, FormHelperText } from '@mui/material'
import { LoadScript, Autocomplete } from '@react-google-maps/api'
import bussines from '../../utils/catalogov2.bussinesses.json'
import { carriers } from './data'
import { toast } from 'react-toastify'
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
    setValue('direccion', formattedAddress) // Sincroniza con React Hook Form
  }

  const onSubmit = async (data) => {
    setError({})
    console.log('data:', data)
    const result = schemaForm.safeParse(data)
    console.log('result:', result)
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
    // Limpiar formulario
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
    <Stack mt={4}>
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
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '0 1rem' }}>
          {/* Campo de Proyecto u Obra */}
          <Stack spacing={2} boxShadow={2} padding={2} mt={1} borderRadius={1}>
            <FormHelperText>Información de proyecto</FormHelperText>
            <Controller
              name="proyecto"
              control={control}
              defaultValue=""
              render={({ field: { onChange, ...restField } }) => (
                <TextField
                  {...restField}
                  error={error.proyecto}
                  label="Proyecto u Obra"
                  size="small"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  onChange={(e) => {
                    return onChange(e.target.value.toUpperCase())
                  }}
                />
              )}
            />

            {/* Campo de Servicio de Paquetería */}
            <Controller
              name="paqueteria"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  error={error.paqueteria}
                  size="small"
                  label="Servicio de Paquetería"
                  select
                  variant="outlined"
                  fullWidth
                  margin="normal"
                >
                  {carriers.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Autocompletado de dirección */}
            <label
              htmlFor="direccion"
              style={{
                display: 'block',
                marginTop: '16px',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              Dirección de Entrega
            </label>
            <Autocomplete
              size="small"
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Escribe tu dirección"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '16px'
                }}
              />
            </Autocomplete>

            {/* Campo oculto para almacenar la dirección */}
            <Controller
              name="direccion"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  {...(error.direccion && {
                    error: true,
                    helperText: error.direccion
                  })}
                  size="small"
                  label="Dirección"
                  value={address} // Sincroniza el valor del autocompletado
                  style={{ display: 'none' }}
                />
              )}
            />
          </Stack>

          {/* Otros campos */}
          <Stack spacing={2} boxShadow={2} padding={2} mt={1} borderRadius={1}>
            <FormHelperText>Información de contacto de Remitente</FormHelperText>
            <Controller
              name="contacto"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  error={error.contacto}
                  label="Nombre del que envía"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="emailContacto"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  error={error.contacto}
                  type="email"
                  required
                  label="Correo del que envía"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="numeroContacto"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  error={error.numeroContacto}
                  label="Número del que envía"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Stack>
          {/* Otros campos */}
          <Stack spacing={2} boxShadow={2} padding={2} mt={1} borderRadius={1}>
            <FormHelperText>Información de contacto Destino</FormHelperText>
            <Controller
              name="contacto_recibe"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  error={error.contacto_recibe}
                  label="Nombre del que recibe"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <FormHelperText>Numero de que recibe</FormHelperText>
            <Controller
              name="numeroContacto_recibe"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  error={error.numeroContacto_recibe}
                  size="small"
                  label="Número del que recibe"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="contacto_recibe_email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  error={error.numeroContacto_recibe}
                  size="small"
                  type="email"
                  required
                  label="Correo del que recibe"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Stack>

          {/* Empresa que envía */}
          <Controller
            name="empresaEnvio"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                error={error.empresaEnvio}
                label="Empresa que envía"
                size="small"
                select
                variant="outlined"
                fullWidth
                margin="normal"
              >
                {bussines.map((option) => (
                  <MenuItem key={option._id.$oid} value={option._id.$oid}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Botón para enviar */}
          <Stack spacing={4} mt={2} mb={2}>
            <Button type="submit" variant="contained" color="primary">
              Enviar
            </Button>
          </Stack>
        </form>
      </LoadScript>
    </Stack>
  )
}

export default FormularioConAutocomplete
