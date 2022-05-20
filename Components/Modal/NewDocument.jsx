/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useMemo, useEffect } from 'react'
import { Drawer, TextField, Box, InputLabel, Select, MenuItem, FormControl, Button, Typography, FormControlLabel, Checkbox } from '@mui/material'
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import NewVehicle from './NewVehicle';
import NewPlan from './NewPlan';
import { useGlobalState } from '../../context/GlobalContext'
import EMPRESAS from '../../lib/empresas.json'

const API = process.env.NEXT_PUBLIC_API

const style = {  
  width: "100%",
  height: "100%",
  bgcolor: 'background.paper',
  borderRadius: '4px',
  overflow: 'auto',
  boxShadow: 24,    pt: 2,
  px: 4,
  pb: 3,
};

const flexColum = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  width: '450px',
  gap: '1rem',
  padding: '0.25rem',
}


const NewDocument = ({ open, close, empresaId, refreshData, listVehicles = [] }) => {

  const { saveLastDocuments } = useGlobalState()

  const [type, setType] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [saveData, setSaveData] = useState(false)

  const dateRequest = watch('request_date')
  const dateDelivery = watch('delivery_date')
  const planWatchSelected = watch('plan')
  const casetasWatch = watch('casetas')
    
  // modal de nuevo vehiculo
  const [vehicleSelected, setVehicleSelected] = useState('')
  const [openNewVehicle, setOpenNewVehicle] = useState(false);
  const handledNewVehicle = (event) => setOpenNewVehicle(event)

  const getVehicleBySlug = async (slug) => {
    const response = await fetch(`${API}/flotilla/planes/slug/${slug}`)
    .then(res => res.json())
    .then(({ planes }) => planes)

    return response
  }
  
  const [planByVehicle, setPlanByVehicle] = useState([])
  // almacena los planes por vehiculo seleccionado
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
    return(
      <FormControl fullWidth>
        <InputLabel id="newVehicle">Lista de unidades</InputLabel>
        <Select
          label="Lista de unidades"
          labelId="newVehicle"
          value={vehicleSelected}
          id="newVehicle"
          fullWidth
          onChange={(e) => {
            setVehicleSelected(e.target.value)
          }}
        >
          <MenuItem onClick={() => handledNewVehicle(true)} value="" >            
          🚛<em>Agregar nueva unidad</em>
          </MenuItem>
          {
            listVehicles.map(vehicle => (
              <MenuItem key={vehicle._id} value={vehicle.placas}>{`${vehicle.placas} - ${vehicle.modelo}`}</MenuItem>
            ))
          }
      </Select>
    </FormControl>
    )
  }

  const [checkbox, setCheckbox] = useState(false)
  
  const handleClose = () => {
    close();
    reset();
    setType('');
    setVehicleSelected('');
    setCheckbox(false);
  }
  
  const onSubmit = async(data) => {

    if(!vehicleSelected) {
      toast.error('Selecciona un vehiculo')
      return
    }

    if(!type){
      toast.info('Selecciona un tipo de documento')
      return
    }

    setSaveData(true)
    const planSelected = planByVehicle.find(item => item._id === planWatchSelected)
    const payload = {
      ...data,
        description: planSelected,
        vehicle: vehicleSelected,
        bussiness_cost: empresaId,
      }
    console.log(payload)
    saveLastDocuments([payload])
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
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
    >
        <Box sx={{ ...style }}> 
          <form style={{
            paddingBottom: '1rem',
          }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Box sx={{ ...flexColum }}>
              <FormControl fullWidth>
                <InputLabel id="type">Tipo de documento</InputLabel>
                <Select
                  labelId="type"
                  id="type"
                  value={type}
                  label="Tipo de documento"
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="traslado">Traslado</MenuItem>
                  <MenuItem value="flete">Flete</MenuItem>
                  <MenuItem value="renta">Renta</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{
                overflow: '',
              }}>
              </Box>              
              { selectVehicles() }
              <FormControl fullWidth>
              <FormControlLabel
                  control={<Checkbox
                    checked={casetasWatch || checkbox} 
                    onChange={() => {
                      setCheckbox(!checkbox)
                    }} 
                    name="checkedA" />}
                  label="Incluir casetas"
                />
              {
                checkbox && (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <TextField id="casetas" label="Costo total" {...register('casetas', { required: false })} sx={{ marginBottom: '10px' }} />
                    <TextField label="TARJETA / BANCO" {...register('tarjeta_deposito', { required: false })} />
                </Box>
                )
              }
              </FormControl>
              {
                vehicleSelected &&
                <FormControl fullWidth>
                <InputLabel id="type">Elije tu plan</InputLabel>
                <Select
                  labelId="plan"
                  id="plan"                  
                  fullWidth
                  label="Elije tu plan"
                  {...register('plan', { required: true })}
                >
                  <MenuItem onClick={() => handledNewPlan(true)} value="" >
                  ✖️<em>Agregar nuevo plan</em>
                  </MenuItem>
                  {
                    planByVehicle.length > 0
                    ? planByVehicle.map(plan => <MenuItem key={plan._id} value={plan._id}>{`${plan.planName} - $${plan.planPrice} PESOS`}</MenuItem>)
                    : <MenuItem value="">No hay planes</MenuItem>
                  }
                </Select>                
              </FormControl>
              }
              <FormControl fullWidth>
                <InputLabel id="client">Cliente</InputLabel>
                <Select
                labelId="client"
                label="Cliente"
                id="client"                
                {...register('client', { required: true })}
              >
                {
                  type === 'traslado' 
                    ? EMPRESAS
                    .filter(empresa => empresa._id === empresaId)
                    .map(empresa => {
                      return (
                        <MenuItem key={empresa._id} value={empresa._id}>{empresa.name}</MenuItem>
                      )
                    })
                    : EMPRESAS
                      .filter(item => item._id !== empresaId)
                      .map(empresa => {
                        return (
                          <MenuItem key={empresa._id} value={empresa._id}>{empresa.name}</MenuItem>
                        )
                      })
                }
              </Select>
              </FormControl>   
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
                label="Fecha de solicitud"
                name="request_date"
                id="request_date"
                variant="outlined"
                fullWidth
                type="date"
                value={dateRequest ? dayjs().format(dateRequest) : dayjs().format('YYYY-MM-DD')}
                { ...register("request_date", { required: true }) }
              />
              { errors.request_date && <small style={{ color: 'red' }}>Este campos es obligatorio</small> }
              <TextField
                label="Fecha de disperción"
                name="delivery_date"
                value={dateDelivery ? dayjs().format(dateDelivery) : dayjs().format('YYYY-MM-DD')}
                id="delivery_date"
                variant="filled"
                fullWidth
                type="date"
                { ...register("delivery_date", { required: true }) }
              />
              { errors.delivery_date && <small style={{ color: 'red' }}>Este campos es obligatorio</small> }
              <TextField
                label="Conductor"
                name="driver"
                id="driver"
                variant="outlined"
                fullWidth
                { ...register("driver", { required: true }) }
              />
              { errors.driver && <small style={{ color: 'red' }}>Este campos es obligatorio</small> }
              <TextField
                label="Ruta"
                name="route"
                id="route"
                variant="outlined"
                fullWidth
                { ...register("route", { required: true }) }
              />
              { errors.route && <small style={{ color: 'red' }}>Este campos es obligatorio</small> }
              <TextField
                label="Recorrido (Km)"
                name="recorrido_km"
                id="recorrido_km"
                variant="outlined"
                fullWidth
                { ...register("recorrido_km", { required: false }) }
              />
              <TextField
                label="Kilometraje de salida"
                name="kilometer_out"
                id="kilometer_out"
                variant="outlined"
                type="number"
                fullWidth
                { ...register("kilometer_out", { required: false }) }
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
                  variant="contained"
                  width="100%"
                  onClick={handleClose}
                  >
                    Cerrar
                </Button>
            </Box>
          </form>
        </Box>
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
    </Drawer>
    
  )
}

export default NewDocument;
