/* eslint-disable react-hooks/exhaustive-deps */
import { Typography, Card, Box, Divider, Modal, TextField, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { modalStyle } from '../../utils/styles'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

const API = process.env.NEXT_PUBLIC_API

const UpdateModal = ({ open, onClose, closeDrawer }) => {
  const [newNamePlan, setNewNamePlan] = useState('')
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [newDescriptionPlan, setNewDescriptionPlan] = useState('')
  const [newPricePlan, setNewPricePlan] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (open.data) {
      setNewNamePlan(open.data.planName)
      setNewDescriptionPlan(open.data.planDescription)
      setNewPricePlan(open.data.planPrice)
    }
    return () => {
      setNewNamePlan('')
      setNewDescriptionPlan('')
      setNewPricePlan('')
    }
  }, [open.open])

  const updatePlanSubmit = async (e) => {
    e.preventDefault()
    await fetch(`${API}/fotilla/plan/update/${open?.data?._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...open?.data,
        planName: newNamePlan,
        planDescription: newDescriptionPlan,
        planPrice: newPricePlan
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
    const [namePlanDelete, setNamePlanDelete] = useState('')
    const deleteConfirm = (e) => {
      setNamePlanDelete(e.target.value)
    }

    useEffect(() => {
      if (namePlanDelete.trim() === name.trim()) {
        console.log('confirmado')
        setIsConfirm(true)
      }
    }, [namePlanDelete])

    return (
      <Modal
        open={open}
        onClose={onClose}
      >
        <Box sx={{
          ...modalStyle,
          padding: '20px',
          margin: '8px',
          justifyContent: 'space-evenly',
          flexDirection: 'column',
          display: 'flex',
          height: '380px',
          width: 'fit-content'
        }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            ¿Está seguro que desea eliminar el plan?
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            Para confirmar escriba el nombre del plan
          </Typography>
          <Typography variant="h5" sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#f5576c',
            color: 'white'
          }}>
            { name }
          </Typography>
          <TextField
            label="Escriba el nombre del plan"
            variant="outlined"
            fullWidth
            value={namePlanDelete}
            onChange={(e) => deleteConfirm(e)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column' }}>
            <Button
              color='error'
              variant="contained"
              onClick={() => handleDeletePlan()}
              disabled={!isConfirm}
              sx={{ mt: 2 }}
            >
              Entiendo y acepto las consecuencias de eliminar el plan
            </Button>
            <Button
              color='info'
              variant="contained"
              sx={{ marginTop: 1 }}
              onClick={() => onClose()}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
    )
  }

  return (
    <Modal
      open={open.open}
      onClose={onClose}
    >
      <Box sx={{ ...modalStyle, padding: '23px', width: '400px' }}>
      <Typography sx={{
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '23px'
      }}>
          Modificar plan
        </Typography>
        <form onSubmit={updatePlanSubmit} style={{ marginBottom: '30px' }}>
          <TextField
            fullWidth={true}
            sx={{ marginBottom: '30px' }}
            label="Nombre del plan"
            value={newNamePlan}
            onChange={(e) => setNewNamePlan(e.target.value)}
          />
          <TextField
            fullWidth={true}
            label="Descripción del plan"
            value={newDescriptionPlan}
            sx={{ marginBottom: '30px' }}
            onChange={(e) => setNewDescriptionPlan(e.target.value)}
          />
          <TextField
            fullWidth={true}
            label="Costo del plan"
            value={newPricePlan}
            sx={{ marginBottom: '30px', fontFamily: 'arial' }}
            onChange={(e) => setNewPricePlan(e.target.value)}
          />
          <Box sx={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Button type='submit' variant='contained'>Modificar</Button>
            <Button onClick={onClose} color="secondary" variant='contained'>Cerrar</Button>
            <Button type="button" onClick={() => setOpenModalDelete(true)} color="error" variant='contained'>Eliminar</Button>
          </Box>
        </form>
      <ModalDeleteValidation name={newNamePlan} open={openModalDelete} onClose={() => setOpenModalDelete(false)} />
      </Box>
    </Modal>
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
    setOpenEdit({
      open: true,
      data: currentPlan
    })
  }

  return (
    <Box sx={{ width: 400, padding: '0 16px' }}>
      <Typography sx={{
        maringTop: '20px',
        textAlign: 'center',
        fontSize: '28px',
        padding: '16px',
        fontWeight: 'bold'
      }}>
        { name }
      </Typography>
      { loading ? <div>Loading...</div> : null }
      { !loading && planes.length === 0 &&
      (
        <Typography variant="h6" marginTop={'20px'}>
          No hay planes disponibles
        </Typography>
      )}
      {
        !loading && planes.length > 0 && (
          planes.map(plane => {
            return (
              <Card key={plane._id}
              onClick={() => openUpdateModal(plane._id)}
              sx={{
                backgroundColor: '#fdfbfb',
                padding: '16px',
                boxShadow: 1,
                margin: '13px 0',
                '&:hover': {
                  backgroundColor: '#cfd9df',
                  cursor: 'pointer'
                }
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Nombre del plan
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem' }}>
                    { plane.planName }
                  </Typography>
                  <Divider sx={{ margin: '10px 0' }}/>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Descripción
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem' }}>
                    { plane.planDescription }
                  </Typography>
                  <Divider sx={{ margin: '10px 0' }}/>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Costo
                  </Typography>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize', lineHeight: '1.25rem', fontFamily: 'arial' }}>
                    { Intl.NumberFormat('en-MX', { style: 'currency', currency: 'MXN' }).format(plane.planPrice) }
                  </Typography>
                </Box>
              </Card>
            )
          })
        )
      }
      <UpdateModal
        open={openEdit}
        onClose={() => setOpenEdit({ open: false, data: null })}
        closeDrawer={closeDrawer}
      />
    </Box>
  )
}

export default PlanesDrawer
