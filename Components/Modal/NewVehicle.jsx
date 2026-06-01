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

const API = process.env.NEXT_PUBLIC_API

const NewVehicle = ({ open, close, chivato, empresaId }) => {
  const { handleSubmit, register, reset } = useForm()
  const [saveData, setSaveData] = useState(false)

  const onSubmit = async (data) => {
    setSaveData(true)
    try {
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
          if (message.name === 'MongoError') {
            throw new Error('Las placas ya existen')
          }

          toast.success('Vehiculo guardado')
          setSaveData(false)
          close()
          reset()
          chivato()
        })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onClose = () => {
    close()
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Placas"
            {...register('placas', { required: true })}
          />
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Modelo"
            {...register('modelo', { required: true })}
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saveData}>Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewVehicle
