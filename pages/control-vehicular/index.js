import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import Select from 'react-select'
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  MenuItem,
  Slider,
  Typography,
  Box,
  Grid
} from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { toast } from 'react-toastify'

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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6">Gurdando Registro...</Typography>
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ maxWidth: 800, mx: 'auto', p: 3 }}
      >
        <Typography variant="h5" gutterBottom>
          Salida de Vehículo
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
          gap={2}
        >
          {['conductor', 'destino'].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              {...register(field)}
              error={!!errors[field]}
              helperText={errors[field]?.message?.toString()}
            />
          ))}

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="subtitle1" gutterBottom>
              Seleccionar Vehículo
            </Typography>
            <Select
              styles={customSelectStyles}
              options={vehicleOptions}
              value={selectedVehicle}
              onChange={handleVehicleChange}
              placeholder="Selecciona un vehículo"
            />
          </Box>

          {['modelo', 'placa', 'Seguro', 'tarjetaCirculacion'].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={watch(field) || ''}
              onChange={(e) => setValue(field, e.target.value)}
              error={!!errors[field]}
              helperText={errors[field]?.message?.toString()}
              fullWidth
            />
          ))}

          <DatePicker
            label="Fecha salida"
            value={watch('fechaSalida') ? dayjs(watch('fechaSalida')) : null}
            onChange={handleDateChange('fechaSalida')}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.fechaSalida}
                helperText={errors.fechaSalida?.message?.toString()}
              />
            )}
          />

          <DatePicker
            label="Fecha llegada"
            value={watch('fechaLlegada') ? dayjs(watch('fechaLlegada')) : null}
            onChange={handleDateChange('fechaLlegada')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />

          <TextField
            label="Kilometraje salida"
            type="number"
            {...register('kmSalida')}
            error={!!errors.kmSalida}
            helperText={errors.kmSalida?.message?.toString()}
          />

          <TextField
            label="Kilometraje llegada"
            type="number"
            {...register('kmLlegada')}
          />
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle1">Accesorios y Herramientas</Typography>
          <FormGroup row>
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
              <FormControlLabel
                key={item}
                control={<Checkbox {...register(item)} />}
                label={item}
              />
            ))}
          </FormGroup>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle1">Estado Carrocería</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Puertas', name: 'PuertasEstado' },
              { label: 'Pintura', name: 'PinturaEstado' },
              { label: 'Interiores', name: 'InterioresEstado' },
              { label: 'Cinturones', name: 'CinturonesEstado' }
            ].map(({ label, name }) => (
              <Grid item xs={12} sm={6} key={name}>
                <TextField
                  select
                  fullWidth
                  label={label}
                  value={watch(name) || ''}
                  onChange={(e) => setValue(name, e.target.value)}
                  error={!!errors[name]}
                  helperText={errors[name]?.message?.toString()}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  <MenuItem value="bueno">Bueno</MenuItem>
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="malo">Malo</MenuItem>
                </TextField>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box mt={3}>
          <Typography gutterBottom>Combustible (Salida)</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={Number(combustible)}
                onChange={(e, val) => setValue('combustibleSalida', val)}
                min={0}
                max={100}
                step={5}
              />
            </Grid>
            <Grid item>
              <TextField
                type="number"
                value={combustible}
                onChange={(e) =>
                  setValue('combustibleSalida', Number(e.target.value))
                }
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 80 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box mt={3}>
          <TextField
            label="Motivo de salida"
            {...register('motivo')}
            multiline
            rows={3}
            fullWidth
          />
        </Box>

        <Box mt={4}>
          <Button type="submit" variant="contained" color="primary">
            Guardar salida
          </Button>
        </Box>
      </Box>
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
