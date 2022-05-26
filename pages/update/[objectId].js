import { useState } from 'react'
import { Drawer, TextField, Box, InputLabel, Select, MenuItem, FormControl, Button, Typography, FormControlLabel, Checkbox, Divider } from '@mui/material'
import { useForm } from "react-hook-form"
import dayjs from 'dayjs';
import EMPRESAS from '../../lib/empresas.json'
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
const API = process.env.NEXT_PUBLIC_API

const formBox = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '1rem',
  padding: '1rem',
  
}

const UpdateModel = ({ type, objectId, currentModel, currentEmpresa }) => {

  const router = useRouter()

  const { register, handleSubmit, errors, watch } = useForm({
    defaultValues: currentModel,
  })

  const dateRequest = watch('request_date')
  const dateDelivery = watch('delivery_date')
  
  const getDateLoco = (date) => {
    if(dateRequest !== currentModel.request_date) {
      return dayjs(date).format('YYYY-MM-DD')
    } else {
      return dayjs(date).add(1, 'day').format('YYYY-MM-DD')
    }
  }
  
  const [saveData, setSaveData] = useState(false)
  const updateOrderSubmit = async (data) => {
    setSaveData(true)
    await fetch(`${API}/flotilla/update/${objectId}?type=${type.toLowerCase()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',        
      }, 
      body: JSON.stringify({
        ...data,
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
  <Box>
    <Box sx={{
      textAlign: 'center',
      padding: '1rem',
    }}>
      <Typography variant="h3">
        {currentEmpresa}
      </Typography>
      <Typography  variant="h4">
        Modificación <p style={{ backgroundColor: 'yellow', display: 'inline', padding: '0.25rem' }}>{type}</p> Folio {currentModel.folio}
      </Typography>
      <small>El tipo de documento y el folio no se pueden actualizar</small>
    </Box>
      <form onSubmit={handleSubmit(updateOrderSubmit)} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
    <Box sx={{ ...formBox }}>
      <TextField
        label="Asunto del documento"
        name="subject"
        id="subject"
        variant="outlined"
        fullWidth
        type="string"
        {...register('subject', { required: true })}
      />
        <TextField
        label="Conductor"
        name="driver"
        id="driver"
        variant="outlined"
        fullWidth
        { ...register("driver", { required: true }) }
      />
        <TextField
        label="Ruta"
        name="route"
        id="route"
        variant="outlined"
        fullWidth
        { ...register("route", { required: true }) }
      />
      <TextField
        label="Recorrido (Km)"
        name="recorrido_km"
        id="recorrido_km"
        variant="outlined"
        fullWidth
        { ...register("recorrido_km", { required: false }) }
      />
      <TextField
        label={`Subtotal ${type.toUpperCase()}`}
        name="subtotal_travel"
        id="subtotal_travel"
        variant="outlined"
        type="text"
        fullWidth
        { ...register("subtotal_travel", { required: true }) }
      />
      <TextField
        label="Nivel de combustible %"
        name="fuel_level"
        id="fuel_level"
        variant="outlined"
        type="number"
        fullWidth
        { ...register("fuel_level", { required: false }) }
      />
      <TextField
        label="Salida de almacén (ADMIN/COMERCIAL)"
        name="document_id"
        id="document_id"
        variant="outlined"
        type="text"
        fullWidth
        { ...register("document_id", { required: false }) }
      />
      <TextField
        label="Folio proyecto"
        name="project_id"
        id="project_id"
        variant="outlined"
        type="text"
        fullWidth
        { ...register("project_id", { required: false }) }
      />
      <TextField
        label="Número de tarjeta de combustible"
        name="fuel_card"
        id="fuel_card"
        variant="outlined"
        fullWidth
        { ...register("fuel_card", { required: false }) }
      />
      <TextField
        label="Carga de combustible"
        name="fuel_amount"
        id="fuel_amount"
        variant="outlined"
        type="text"
        fullWidth
        { ...register("fuel_amount", { required: false }) }
      />
      <TextField
        maxRows={4}
        label="Link Google Maps"
        name="observations"
        id="link_googlemaps"
        variant="outlined"
        fullWidth
        type="text"
        { ...register("link_googlemaps", { required: false }) }
      />
    </Box>
    <Box sx={{ ...formBox }}>
      {/* segunda parte del formulario */}
      <TextField
        label="Fecha de solicitud"
        name="request_date"
        id="request_date"
        variant="outlined"
        fullWidth
        type="date"
        value={getDateLoco(dateRequest)}
        { ...register("request_date", { required: true }) }
      />
      <TextField
        label="Fecha de disperción"
        name="delivery_date"
        value={getDateLoco(dateDelivery)}
        id="delivery_date"
        variant="filled"
        fullWidth
        type="date"
        { ...register("delivery_date", { required: true }) }
      />
      <FormControl fullWidth>
        <InputLabel id="client">Cliente</InputLabel>
        <Select
        labelId="client"
        label="Cliente"
        id="client"
        value={EMPRESAS.find(empresa => empresa._id === currentModel.client)._id}
        {...register('client', { required: true })}
      >
        {
          EMPRESAS
          .map(empresa => {
            return (
              <MenuItem key={empresa._id} value={empresa._id}>{empresa.name}</MenuItem>
            )
          })
        }
      </Select>
      </FormControl>
      {
        currentModel.casetas && (
        <>
          <Divider />
          <Typography variant='small' fullWidth>Información de casetas</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField id="casetas" label="Costo total" {...register('casetas', { required: false })} sx={{ marginBottom: '10px' }} />
            <TextField label="TARJETA / BANCO / NOMBRE" {...register('tarjeta_deposito', { required: false })} />
        </Box>
        <Divider />
        </>
        )
      }
      <Box sx={{ display: 'flex', gap: "1.25rem", margin: '10px', justifyContent: 'center' }}>
        <Button
          variant="contained"
          width="100%"
          type="submit"
          disabled={saveData}
          >
            Guardar
        </Button>
        <Button
          variant="outlined"
          width="100%"
          onClick={() => router.push(`/${currentModel.bussiness_cost}`)}
        >
          Regresar
        </Button>
      </Box>
    </Box>

      </form>
    </Box>

  )

}

export async function getServerSideProps(context) {

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
