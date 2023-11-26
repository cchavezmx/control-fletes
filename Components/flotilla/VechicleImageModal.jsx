/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material'
import { modalStyle } from '../../utils/styles'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
const API = process.env.NEXT_PUBLIC_API
// añadir funcion para guadar fecha de verificacion

function VechicleImageModal ({ openModal, row, close }) {
  const { register, handleSubmit } = useForm({ defaultValues: { ...row } })
  const [nextImage, setNextImage] = useState(null)
  const { picture } = row

  const router = useRouter()
  const handledFormSubmit = async (data) => {
    if (data.picture[0].type) {
      const format = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!format.includes(data.picture[0]?.type)) {
        toast.error('Formato de imagen no valido')
        return
      }

      setNextImage(URL.createObjectURL(data.picture[0]))
      const formatDataImg = new FormData()
      formatDataImg.append('bucket', data.picture[0])
      formatDataImg.append('flotilla', row.id)

      await fetch(`${API}/storage/upload/`, {
        method: 'POST',
        body: formatDataImg,
        redirect: 'follow'
      })
        .then(res => res.json())
        .then(res => {
          console.log({ res })
          if (res.message === 'Archivo subido con exito') {
            toast.success(res.message)
            setNextImage(null)
            router.replace(router.asPath)
            close()
          } else {
            toast.error('Error al subir imagen')
            setNextImage(null)
          }
        })
    }
  }

  return (
    <Modal
    open={openModal}
    onClose={close}
  >
    <Box sx={{ ...modalStyle, padding: 2, width: 450 }}>
      <Typography variant="h6" component="h2" sx={{ textAlign: 'center', fontWeight: '900', marginBottom: 2 }}>
        Imagen del vehiculo
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <img src={nextImage || picture} alt={picture} style={{
          width: '400px',
          height: 'auto',
          objectFit: 'cover'
        }} />
        <form onSubmit={handleSubmit(handledFormSubmit)}>
          <small>
            <strong>Nota:</strong> Si subes una imagen nueva se remplazara la anterior
          </small>
        <TextField
          id="picture"
          variant="outlined"
          type="file"
          fullWidth
          {...register('picture', { required: false })}
        />
        <Stack direction="row" spacing={2} sx={{ marginTop: 2, justifyContent: 'center' }}>
          <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Cambiar imagen
          </Button>
        </Stack>
        </form>
      </Box>
    </Box>
    </Modal>
  )
}

export default VechicleImageModal
