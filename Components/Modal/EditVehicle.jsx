import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
const API = process.env.NEXT_PUBLIC_API

const EditVehicles = (props) => {
  const { open, close, data } = props

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
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[400px]">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handledFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
          </DialogHeader>

          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Placa"
            type="text"
            {...register('placas', { required: true })}
          />
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Modelo"
            type="text"
            {...register('modelo', { required: true })}
          />
          <input
            className="w-full text-sm"
            type="file"
            {...register('picture', { required: false })}
          />

          <div className={`w-full p-2 rounded ${!data.expiration_card ? 'bg-gray-100' : ''}`}>
            <input
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
              type="date"
              value={getDateLoco(dateExpCard)}
              {...register('expiration_card', { required: false })}
            />
            {!data.expiration_card && <span className="text-xs text-red-600">Configura el vencimiento</span>}
          </div>

          <div className={`w-full p-2 rounded ${!data.expiration_verify ? 'bg-gray-100' : ''}`}>
            <input
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
              type="date"
              value={getDateLoco(dateExpVeriy)}
              {...register('expiration_verify', { required: false })}
            />
            {!data.expiration_verify && <span className="text-xs text-red-600">Configura el vencimiento</span>}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              defaultChecked={!isActive}
              onChange={() => setIsActive(!isActive)}
            />
            Desactivar vehiculo
          </label>

          <div className="flex gap-2 justify-end">
            <Button type="submit">Guardar</Button>
            <Button variant="secondary" onClick={close}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditVehicles
