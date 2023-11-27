import { useEffect, useState } from 'react'
import { Box, Button, Divider, Modal, Stack, TextField, Typography } from '@mui/material'
import { modalStyle } from '../../utils/styles'

function NewPlateModal ({ open, onClose, handledNewVehicle }) {
  const [plate, setPlate] = useState('')
  const handleSubmit = () => {
    handledNewVehicle({ placas: plate, picture: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png' })
  }

  useEffect(() => {
    return () => {
      setPlate('')
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box sx={{ ...modalStyle, padding: '20px' }}>
        <form onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2" sx={{ textAlign: 'center', fontWeight: '900', marginBottom: 2 }}>
          Nuevo vehiculo
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Añadir la placa del vehiculo"
            id="placas"
            variant="outlined"
            placeholder='ABC-1234'
            type="text"
            fullWidth
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color='error' onClick={onClose}>Cancelar</Button>
            <Button variant="contained" type="submit">Añadir nuevo</Button>
          </Stack>
        </Box>
        </form>
      </Box>
    </Modal>
  )
}

export default NewPlateModal
