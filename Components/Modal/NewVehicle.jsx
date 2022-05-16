import { useState } from 'react'
import { Modal, Box, Typography, TextField, Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'


const API = process.env.NEXT_PUBLIC_API

const style = {  
  width: "20%",
  height: "fit-content",
  position: 'absolute',  
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  overflow: 'auto',
  boxShadow: 24,  
};

const form = {
  padding: '2px', marginBottom: '20px'
}

const NewVehicle = ({ open, close, chivato, empresaId }) => {

  const { handleSubmit, register, reset } = useForm();
  const [saveData, setSaveData] = useState(false)

  const onSubmit = async (data) => {
    setSaveData(true)
    try{
      await fetch(`${API}/flotilla/vehiculo/insert`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          bussiness_cost: empresaId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(({ message }) => {
        if(message.name === 'MongoError'){
          throw new Error("Las placas ya existen")
        } 

        toast.success('Vehiculo guardado')
        setSaveData(false)
        close() 
        reset()
        chivato()

      })      

    }catch(error){
      toast.error(error.message)
    }
  }

  const onClose = () => {
    close();
    reset();
  }


  return (
    <Modal
      open={open}
      onClose={close}

    >
      <Box sx={{ ...style }} p={2}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6" sx={{ ...form }}>
            Crear Nuevo Vehículo
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField label="Placas" {...register('placas', { required: true })} sx={{ ...form }} />
            <TextField label="Modelo" {...register('modelo', { required: true })} sx={{ ...form }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <Button variant="outlined" onClick={() => onClose()}>Cancelar</Button>
            <Button type='submit' variant='contained' disable={!saveData}>Guardar</Button>
          </Box>
        </form>
      </Box>

    </Modal>
  )
}

export default NewVehicle;
