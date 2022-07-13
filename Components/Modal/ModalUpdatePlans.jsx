import { useState } from 'react'
import { Typography, Modal, Box, TextField, Button } from '@mui/material'
import { modalStyle, flexColum } from '../../utils/styles'

// usar form

const ModalUpdatePlan = ({ data, open, setOpen }) => {
  const { planDescription, planPrice } = data || {}
  const [description, setDescription] = useState(planDescription)
  const [price, setPrice] = useState(planPrice)

  const updatePlanSubmit = async (e) => {
    console.log(e.preventDefault())
  }

  return (
    <Modal
    open={open}
    onClose={() => setOpen(false)}
    >
      <Box sx={{ ...modalStyle }} p={2}>
        <form style={{ ...flexColum, width: '100%' }} onSubmit={updatePlanSubmit}>
          <Typography variant="h6">Cancelar Documento</Typography>
            <TextField
              fullWidth={true}
              label="Descripción del plan"
              id="planDescription"
              multiline
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              fullWidth={true}
              label="Precio del plan"
              multiline
              variant="outlined"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
        <Box>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={!!data?.isCancel_status}
          >
            Guardar
          </Button>
        </Box>
        </form>
      </Box>
    </Modal>
  )
}

export default ModalUpdatePlan
