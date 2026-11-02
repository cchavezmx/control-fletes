/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

const API = process.env.NEXT_PUBLIC_API

const UpdateModal = ({ open, onClose, closeDrawer }) => {
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const nameRef = useRef(null)
  const descRef = useRef(null)
  const priceRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (open.open && open.data) {
      if (nameRef.current) nameRef.current.value = open.data.planName || ''
      if (descRef.current) descRef.current.value = open.data.planDescription || ''
      if (priceRef.current) priceRef.current.value = open.data.planPrice || ''
    }
    return () => {
      if (nameRef.current) nameRef.current.value = ''
      if (descRef.current) descRef.current.value = ''
      if (priceRef.current) priceRef.current.value = ''
    }
  }, [open.open, open.data])

  const updatePlanSubmit = async (e) => {
    e.preventDefault()
    await fetch(`${API}/fotilla/plan/update/${open?.data?._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...open?.data,
        planName: nameRef.current?.value || '',
        planDescription: descRef.current?.value || '',
        planPrice: priceRef.current?.value || ''
      })
    })
      .then(res => res.json())
      .then(({ message }) => {
        if (!message) {
          toast.error('Error al actualizar el plan')
        }
        toast.success('Plan actualizado correctamente')
        router.replace(router.asPath)
        closeDrawer()
      })
  }

  const handleDeletePlan = async () => {
    await fetch(`${API}/fotilla/plan/update/${open?.data?._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...open?.data,
        isActive: false
      })
    })
      .then(res => res.json())
      .then(({ message }) => {
        if (!message) {
          toast.error('Error al actualizar el plan')
        }
        toast.success('Plan eliminado correctamente')
        router.replace(router.asPath)
        closeDrawer()
      })
  }

  const ModalDeleteValidation = ({ name, open, onClose }) => {
    const [isConfirm, setIsConfirm] = useState(false)
    const nameDeleteRef = useRef(null)
    const deleteConfirm = (e) => {
      setIsConfirm(e.target.value.trim() === name.trim())
    }

    useEffect(() => {
      if (open && nameDeleteRef.current) {
        nameDeleteRef.current.value = ''
      }
      setIsConfirm(false)
    }, [open])

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">¿Está seguro que desea eliminar el plan?</DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm font-bold">Para confirmar escriba el nombre del plan</p>
          <p className="text-center font-bold bg-red-400 text-white py-1 rounded">{name}</p>
          <input
            ref={nameDeleteRef}
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm mt-2"
            placeholder="Escriba el nombre del plan"
            defaultValue=""
            onChange={deleteConfirm}
          />
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={() => handleDeletePlan()}
              disabled={!isConfirm}
            >
              Entiendo y acepto las consecuencias de eliminar el plan
            </Button>
            <Button variant="secondary" onClick={() => onClose()}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open.open} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Modificar plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={updatePlanSubmit} className="flex flex-col gap-4">
          <input
            ref={nameRef}
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Nombre del plan"
            defaultValue=""
          />
          <input
            ref={descRef}
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Descripción del plan"
            defaultValue=""
          />
          <input
            ref={priceRef}
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            placeholder="Costo del plan"
            type="text"
            inputMode="decimal"
            defaultValue=""
          />
          <div className="flex justify-between">
            <Button type="submit">Modificar</Button>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            <Button variant="destructive" type="button" onClick={() => setOpenModalDelete(true)}>Eliminar</Button>
          </div>
        </form>
        <ModalDeleteValidation name={newNamePlan} open={openModalDelete} onClose={() => setOpenModalDelete(false)} />
      </DialogContent>
    </Dialog>
  )
}

const PlanesDrawer = ({ id, name, closeDrawer }) => {
  const [openEdit, setOpenEdit] = useState({
    open: false,
    data: null
  })

  const [loading, setLoading] = useState(true)
  const [planes, setPlanes] = useState([])
  const getVehicleBySlug = async (slug) => {
    await fetch(`${API}/flotilla/planes/slug/${slug}`)
      .then(res => res.json())
      .then(({ planes }) => setPlanes(planes))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getVehicleBySlug(id)
  }, [id])

  const openUpdateModal = (id) => {
    const currentPlan = planes.find(({ _id }) => _id === id)
    if (!currentPlan) {
      setPlanes([])
    }
    setOpenEdit({
      open: true,
      data: currentPlan
    })
  }

  return (
    <div className="w-full px-4">
      <h2 className="text-center text-2xl font-bold py-4">{name}</h2>
      {loading ? <div>Loading...</div> : null}
      {!loading && planes?.length === 0 && (
        <p className="text-lg mt-5">No hay planes disponibles</p>
      )}
      {
        !loading && planes?.length > 0 && (
          planes.map(plane => (
            <div
              key={plane._id}
              onClick={() => openUpdateModal(plane._id)}
              className="bg-[#fdfbfb] p-4 shadow-sm my-3 rounded cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <div>
                <p className="font-bold">Nombre del plan</p>
                <p className="text-lg">{plane.planName}</p>
                <Separator className="my-2" />
              </div>
              <div>
                <p className="font-bold">Descripción</p>
                <p className="text-lg">{plane.planDescription}</p>
                <Separator className="my-2" />
              </div>
              <div>
                <p className="font-bold">Costo</p>
                <p className="text-base font-medium">
                  {Intl.NumberFormat('en-MX', { style: 'currency', currency: 'MXN' }).format(plane.planPrice)}
                </p>
              </div>
            </div>
          ))
        )
      }
      <UpdateModal
        open={openEdit}
        onClose={() => setOpenEdit({ open: false, data: null })}
        closeDrawer={closeDrawer}
      />
    </div>
  )
}

export default PlanesDrawer
