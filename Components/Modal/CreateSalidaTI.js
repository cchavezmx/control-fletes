import { useState } from 'react'
import { Button, Dialog, TextField, Box, Typography } from '@mui/material'
import { useSWRConfig } from 'swr'
import { toast } from 'react-toastify'
const API = process.env.NEXT_PUBLIC_API

const CreateSalidaTI = ({ equipo }) => {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [obra, setObra] = useState(null)
  const { mutate } = useSWRConfig()

  const generateResponsive = () => {
    const url = `${API}/inventarioIT/responsiva`
    const payload = {
      nombre: user,
      obra,
      equipoId: equipo.equipo._id,
      ...equipo.equipo
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    }

    // se crea la responsiva sin firmar
    fetch(url, requestOptions)
      .then(response => response.blob())
      .then(result => {
        console.log({ result })
        const url = window.URL.createObjectURL(result)
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', 'responsiva.pdf')
        a.click()
      })

    // se crear nueva entrada en el historial
    const id = equipo.equipo._id
    const URL = `${API}/inventarioIT/assign?equipo=${id}`
    const requestAssing = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: user, unidad: obra }),
      redirect: 'follow'
    }

    fetch(URL, requestAssing)
      .then(response => response.json())
      .then(result => {
        console.log({ result })
        setOpen(false)
        mutate(`${API}/inventarioIT/find?equipo=${id}`)
        toast.success('Usuario asignado correctamente')
      })
  }

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '20px'
          }}
        >
        <Typography variant="h6">Generar documento para Salida</Typography>
          <TextField
            label="Nombre"
            name='nombre'
            id='nombre'
            onChange={e => setUser(e.target.value)}
          />
          <TextField
            label="Obra"
            name='obra'
            id='obra'
            onChange={e => setObra(e.target.value)}
          />
          <Button
            onClick={generateResponsive}
            variant="contained"
            color="secondary"
            size="small">
            Generar Salida
          </Button>
        </Box>
      </Dialog>
      <Button
        fullWidth
        onClick={() => setOpen(true)}
        type='button'
        variant="contained"
        color="secondary"
        size="small">
        Nueva Responsiva de equipo
      </Button>
    </>
  )
}

export default CreateSalidaTI
