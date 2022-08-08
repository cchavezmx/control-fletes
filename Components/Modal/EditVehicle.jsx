import { useState } from 'react'
import {
  Modal,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { modalStyle, form, flexColum, flexRow } from '../../utils/styles'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
const API = process.env.NEXT_PUBLIC_API
// añadir funcion para guadar fecha de verificacion

const EditVehicles = (props) => {
  const {
    open,
    close,
    data
  } = props

  const { register, handleSubmit, watch } = useForm({ defaultValues: { ...data } })

  const dateExpCard = watch('expiration_card')
  const dateExpVeriy = watch('expiration_verify')

  const getDateLoco = (date) => {
    if (!date) {
      return dayjs(new Date()).format('YYYY-MM-DD')
    } else {
      return dayjs(date).format('YYYY-MM-DD')
    }
  }

  const router = useRouter()
  const refreshData = () => {
    router.replace(router.asPath)
  }

  const [isActive, setIsActive] = useState(data.is_active)

  const fetchData = async ({ _picture, ...payload }) => {
    await fetch(`${API}/flotilla/vehiculo/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        expiration_card: getDateLoco(dateExpCard) === getDateLoco(new Date()) ? null : getDateLoco(dateExpCard),
        expiration_verify: getDateLoco(dateExpVeriy) === getDateLoco(new Date()) ? null : getDateLoco(dateExpVeriy),
        is_active: isActive

      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.message)
        if (res) {
          toast.success('Actualizado')
          refreshData()
          close()
        }
      })
      .catch(() => console.log('error'))
  }

  const handledFormSubmit = async (data) => {
    if (data.picture[0].type) {
      console.log('picture', data.picture, data.picture[0]?.type)

      const format = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!format.includes(data.picture[0]?.type)) {
        toast.error('Formato de imagen no valido')
        return
      }

      const formatDataImg = new FormData()
      formatDataImg.append('bucket', data.picture[0])
      formatDataImg.append('flotilla', data._id)

      await fetch(`${API}/storage/upload/`, {
        method: 'POST',
        body: formatDataImg,
        redirect: 'follow'
      })
        .then(res => res.json())
        .then(res => {
          console.log(res)
          if (res.message === 'Archivo subido con exito') {
            fetchData(data)
          } else {
            toast.error('Error al subir imagen')
          }
        })
    } else {
      fetchData(data)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
    >
      <form style={{ ...form }} onSubmit={handleSubmit(handledFormSubmit)}>
        <Box sx={{ ...modalStyle }}>
          <Box sx={{ ...flexColum, width: '100%', padding: '20px' }}>
            <TextField
              label="Placa"
              id="placas"
              variant="outlined"
              type="text"
              fullWidth
              {...register('placas', { required: true })}
            />
            <TextField
              label="Modelo"
              id="modelo"
              variant="outlined"
              type="text"
              fullWidth
              {...register('modelo', { required: true })}
            />
            <TextField
              label="picture"
              id="picture"
              variant="outlined"
              type="file"
              fullWidth
              {...register('picture', { required: false })}
            />
          <Box sx={{
            width: '100%',
            backgroundColor: !data.expiration_card ? '#f5f5f5' : null,
            padding: '0.5rem 0'
          }}>
            <TextField
              label="Vencimiento Tarjeta"
              id="expiration_card"
              variant="outlined"
              type="date"
              fullWidth
              value={getDateLoco(dateExpCard)}
              {...register('expiration_card', { required: false })}
            />
            { !data.expiration_card && <small style={{ color: 'red' }}>Configura el vencimiento</small> }
          </Box>
          <Box sx={{
            width: '100%',
            backgroundColor: !data.expiration_card ? '#f5f5f5' : null,
            padding: '0.5rem 0'
          }}>
            <TextField
              label="Vencimiento verificación"
              id="expiration_verify"
              variant="outlined"
              type="date"
              fullWidth
              value={getDateLoco(dateExpVeriy)}
              {...register('expiration_verify', { required: false })}
            />
            { !data.expiration_verify && <small style={{ color: 'red' }}>Configura el vencimiento</small> }
          </Box>
            <FormControlLabel
            control={<Checkbox defaultChecked={!isActive} onChange={() => setIsActive(!isActive)} />}
            label="Desactivar vehiculo"
            />
          </Box>
          <Box sx={{ ...flexRow, width: '100%', padding: '20px', flexDirection: 'row' }}>
            <Button type='submit' variant="contained" color="secondary">Guardar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => close()}
              >Cancelar</Button>
          </Box>
      </Box>
      </form>
    </Modal>
  )
}

export default EditVehicles
