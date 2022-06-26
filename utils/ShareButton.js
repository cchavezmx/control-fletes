import { useState } from 'react'
import { Button, Modal, Box, Typography, TextField, TextareaAutosize } from '@mui/material'
import { modalStyle, flexColum } from '../utils/styles'
import { toast } from 'react-toastify'

const emoticones = ["🚀", "🥶", "😁", "🙈", "📷", "🍻", "🦜", "❤️", "👽", "👾", "🐑", "🧶", "🏃🏻‍♂️🏃🏻‍♂️"]

const ShareButton = ({ id, type, title }) => {
  
  const [subjects, setSubjects] = useState('')
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

  const shareData = {
    title,
    text: `El link es única y puedes consultarla las veces que necesites ${emoticones[Math.floor(Math.random() * emoticones.length)]}`,
    url: `https://control-fletes.vercel.app/flotilla/${id}/${type}`,
    subjects,
    message
  }

  const handleShare = async() => {
    try{
      await fetch('api/nodmailer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareData)
      })
      toast.success('Correo enviado')
      setOpen(false)
    }catch(error){
      console.log(error)
    }
  }

  const modal = (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
    >
      <Box sx={{ ...modalStyle, width: '700px' }} p={2}>
        <Box sx={{ ...flexColum, width: '100%' }}>
        <Typography variant="h6">Compartir salida</Typography>
          <TextField 
            fullWidth
            label="Añadadir remitentes separados por comas"
            name="remitentes"
            onChange={(e) => setSubjects(e.target.value)}
          />
          <TextareaAutosize
            aria-label="minimum height"
            minRows={8}
            placeholder="Añadir mensaje"
            style={{ width: '100%', border: '1px solid #ccc', fontSize: '1.2rem', padding: '10px' }}
            onChange={(e) => setMessage(e.target.value)}
          />                    
          <Box>
            <Button variant="contained" color="primary" onClick={handleShare}>Compartir</Button>
              {" "}
            <Button variant="contained" color="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          </Box> 
        </Box>
      </Box>
    </Modal>
  )
  
  
  return (
    <>
      { modal }
      <Button variant='contained' color="secondary" onClick={() => setOpen(true)}>
        Enviar
    </Button>
    </>
  )
}

export default ShareButton