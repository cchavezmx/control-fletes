/* eslint-disable react/display-name */
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material'
import { modalStyle, flexColum } from '../../utils/styles'
import { toast } from 'react-toastify';
const API = process.env.NEXT_PUBLIC_API

const CancelModalDocument = forwardRef(({ data, refreshData, children }, ref) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(data?.isCancel_status || null);

  const showToggle = () => setOpen(!open);

  useImperativeHandle(ref, () => {
    return {
      showToggle,
    }
  })
  
  console.log(data)

  const updateOrderSubmit = async (e) => {
    e.preventDefault();    
    await fetch(`${API}/flotilla/update/${data._id}?type=${data.type.toLowerCase()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',        
      }, 
      body: JSON.stringify({
        isCancel_status: reason,
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.message._id) {
        toast.success('Documento cancelado')
        refreshData()
        showToggle()
      } else {
        toast.error(res.message)
      }
    })    
  }

  return (
    <>
      <Modal
      open={open}
      onClose={() => setOpen(false)}
      > 
        <Box sx={{ ...modalStyle }} p={2}>
          <form style={{ ...flexColum, width: '100%' }} onSubmit={updateOrderSubmit}>
            <Typography variant="h6">Cancelar Documento</Typography>
              <TextField 
                fullWidth={true}
                label="Añada el motivo de la cancelación"
                multiline
                rows={4}
                variant="outlined"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
          <Box>
            {
              reason && (
              <Button 
                type="submit"
                variant="contained"
                color="error"
                disabled={!!data?.isCancel_status}
              >
                Guardar
              </Button>
              )
            }
          </Box>
          </form>
        </Box>
      </Modal>
      { children }
    </>
  )
})

export default CancelModalDocument;
