/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
const API = process.env.NEXT_PUBLIC_API

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
    <Dialog open={openModal} onOpenChange={close}>
      <DialogContent className="max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-center">Imagen del vehiculo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <img
            src={nextImage || picture}
            alt={picture}
            className="w-[400px] h-auto object-cover"
          />
          <form onSubmit={handleSubmit(handledFormSubmit)} className="w-full">
            <p className="text-xs mb-2">
              <strong>Nota:</strong> Si subes una imagen nueva se remplazara la anterior
            </p>
            <input
              id="picture"
              type="file"
              className="w-full text-sm"
              {...register('picture', { required: false })}
            />
            <div className="flex justify-center mt-4">
              <Button type="submit">Cambiar imagen</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VechicleImageModal
