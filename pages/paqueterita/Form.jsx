import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Stack, TextField, Button, MenuItem, Container } from '@mui/material'
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
  empresaEnvio: z.string().min(3)
})

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
    const doc = await saveData(data)
    setIdResponse(doc.success_id)
    // Limpiar formulario
    setValue('proyecto', '')
    setValue('paqueteria', '')
    setValue('direccion', '')
    setValue('contacto', '')
    setValue('numeroContacto', '')
    setValue('empresaEnvio', '')
    setAddress('')
  }

  return (
    <Container>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Campo de Proyecto u Obra */}
          <Controller
            name="proyecto"
            control={control}
            defaultValue=""
            render={({ field: { onChange, ...restField } }) => (
              <TextField
                {...restField}
                error={error.proyecto}
                label="Proyecto u Obra"
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
                value={address} // Sincroniza el valor del autocompletado
                style={{ display: 'none' }}
              />
            )}
          />

          {/* Otros campos */}
          <Controller
            name="contacto"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                error={error.contacto}
                label="Nombre de Contacto"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />
674d731a944e4d0da76d7fd4
          <Controller
            name="numeroContacto"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                error={error.numeroContacto}
                label="Número de Contacto"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />

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
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button type="submit" variant="contained" color="primary">
              Enviar
            </Button>
          </Stack>
        </form>
      </LoadScript>
    </Container>
  )
}

export default FormularioConAutocomplete
