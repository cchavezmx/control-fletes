/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from 'react'
import { Drawer, Box, TextField, Button, Typography, FormHelperText, LinearProgress, Alert, Select, MenuItem } from '@mui/material'
import { useForm } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import { useRouter } from 'next/router'
const API_URL = process.env.NEXT_PUBLIC_API

const style = {
  width: '450px',
  height: '100%',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  overflow: 'auto',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  pt: 2,
  px: 4,
  pb: 3
}

const NuevoEquipoInventario = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fechaCompra: new Date().toISOString().slice(0, 10)
    }
  })
  const [open, setOpen] = useState(false)
  const toggleDrawer = () => setOpen(!open)
  const fileInputRef = useRef()
  const [prevImage, setPrevImage] = useState(null)

  const [url, setUrl] = useState(null)
  const previewFile = (e) => {
    const file = fileInputRef.current.files[0]
    const reader = new FileReader()

    const formdata = new FormData()
    formdata.append('formData', file)
    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    }

    reader.addEventListener('load', () => {
      const prevImg = document.createElement('img')
      prevImg.src = reader.result
      setPrevImage(prevImg)
      fetch(`${API_URL}/inventarioIT/upload`, requestOptions)
        .then(response => response.json())
        .then(result => {
          console.log('result', result)
          setUrl(result.url)
          setPrevImage(null)
          fileInputRef.current.value = ''
        })
        .catch(error => console.log('error', error))
    })

    reader.readAsDataURL(file)
    // prev url file
  }

  const router = useRouter()
  const onSubmit = (data) => {
    const { almacenamiento, memoria, pantalla, procesador, otro, ...rest } = data
    const payload = {
      ...rest,
      imagen: url,
      descripcion: {
        almacenamiento,
        memoria,
        pantalla,
        procesador,
        otro
      }
    }

    fetch(`${API_URL}/inventarioIT/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(res => {
        console.log('res', res)
        if (res.message) {
          console.log('success')
          setUrl(null)
          reset()
          toggleDrawer()
          router.replace(router.asPath)
        }
      })
  }

  const enumTypes = ['PC', 'Laptop', 'Impresora', 'Monitor', 'Otro']

  return (
    <>
      <Drawer
        open={open}
        onClose={toggleDrawer}
        anchor="right">
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '1rem' }}>
            Nuevo Equipo
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ ...style }}>
          <FormHelperText sx={{ textAlign: 'center' }}>
            Tipo de equipo
          </FormHelperText>
          <Select
            error={errors.type}
            label="Tipo"
            name="type"
            id="type"
            variant="outlined"
            {...register('type', { required: true })}
          >
            {
              enumTypes.map((type, index) => (
                <MenuItem key={type + index} value={type}>
                  { type }
                </MenuItem>
              ))
            }
          </Select>
          <TextField
            error={errors.ean}
            label="ean"
            name="ean"
            id="ean"
            variant="outlined"
            fullWidth
            type="string"
            {...register('ean', { required: true })}
          />
          <TextField
            error={errors.mac}
            label="mac"
            name="mac"
            id="mac"
            variant="outlined"
            fullWidth
            type="string"
            {...register('mac', { required: true })}
          />
          <TextField
            label="Marca"
            error={errors.marca}
            name="marca"
            id="marca"
            variant="outlined"
            fullWidth
            type="string"
            {...register('marca', { required: true })}
          />
          <TextField
            error={errors.modelo}
            label="Modelo"
            name="modelo"
            id="modelo"
            variant="outlined"
            fullWidth
            type="string"
            {...register('modelo', { required: true })}
          />
          <TextField
            error={errors.serie}
            label="Serie"
            name="serie"
            id="serie"
            variant="outlined"
            fullWidth
            type="string"
            {...register('serie', { required: true })}
          />
          <TextField
            error={errors.mac}
            label="Ubicación"
            name="ubicacion"
            id="ubicacion"
            variant="outlined"
            fullWidth
            type="string"
            {...register('ubicacion', { required: true })}
          />
          <TextField
            error={errors.mac}
            label="Garantía"
            name="garantia"
            id="garantia"
            variant="outlined"
            fullWidth
            type="string"
            {...register('garantia', { required: false })}
          />
          <FormHelperText sx={{ textAlign: 'center' }}>Fecha de compra</FormHelperText>
          <TextField
            error={errors.fechaCompra}
            name="fechaCompra"
            id="fechaCompra"
            variant="outlined"
            fullWidth
            type="date"
            {...register('fechaCompra', { required: true })}
          />
          <TextField
            error={errors.mac}
            label="Precio"
            name="precio"
            id="precio"
            variant="outlined"
            fullWidth
            type="number"
            {...register('precio', { required: true })}
          />
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '1rem' }}>
            Características
          </Typography>
          <TextField
            label="Pantalla"
            name="pantalla"
            id="pantalla"
            variant="outlined"
            fullWidth
            type="string"
            {...register('pantalla')}
          />
          <TextField
            label="Procesador"
            name="procesador"
            id="procesador"
            variant="outlined"
            fullWidth
            type="string"
            {...register('procesador')}
          />
          <TextField
            label="Memoria"
            name="memoria"
            id="memoria"
            variant="outlined"
            fullWidth
            type="string"
            {...register('memoria')}
          />
          <TextField
            label="Almacenamiento"
            name="almacenamiento"
            id="almacenamiento"
            variant="outlined"
            fullWidth
            type="string"
            {...register('almacenamiento')}
          />
          <TextField
            label="otro"
            name="otro"
            id="otro"
            variant="outlined"
            fullWidth
            type="string"
            {...register('otro')}
          />
          <Box>
            <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '1rem' }}>
              Imagen
            </Typography>
            <input
              ref={fileInputRef}
              name="imagen_url"
              id="imagen_url"
              variant="outlined"
              fullWidth
              type="file"
              onChange={previewFile}
            />
            {
              prevImage && (
                <>
                  <img src={prevImage.src} alt="imagen" className='prevImage' />
                  <LinearProgress />
                </>
              )
            }
            {
              url && (
                <Alert severity="success">Carga terminada</Alert>
              )
            }
          </Box>

          <Button variant="contained" type="submit" sx={{ marginTop: '1rem' }}>Guardar</Button>
          </Box>
          </form>
      </Drawer>
      <Button variant='contained' endIcon={<AddIcon />} onClick={toggleDrawer}>Equipo</Button>
    </>
  )
}

export default NuevoEquipoInventario
