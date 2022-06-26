import { useState, useEffect } from 'react'
import { Button, Modal, Box, Typography, TextField, TextareaAutosize, Autocomplete, Chip } from '@mui/material'
import { modalStyle, flexColum } from '../utils/styles'
import { toast } from 'react-toastify'

const emoticones = ["🚀", "🥶", "😁", "🙈", "📷", "🍻", "🦜", "❤️", "👽", "👾", "🐑", "🧶", "🏃🏻‍♂️🏃🏻‍♂️"]
const emailList = process.env.NEXT_PUBLIC_GMAIL_LIST.split(',').sort()

const ShareButton = ({ id, type, title }) => {
  
  const [subjects, setSubjects] = useState([])
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)  
  const [fixedOptions, setFixedOptions] = useState([])
  
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
  
  const handleChange = (event, newValue) => {   
    setSubjects([
      ...fixedOptions,
      ...newValue.filter((option) => fixedOptions.indexOf(option) === -1),
    ]);
  }

  const handleClose = () => {
    setOpen(false)
    setSubjects([])
    setMessage('')
    setFixedOptions([])
  }

  useEffect(() => {
    return () => {
      handleClose()
    }
  }, [])

  const modal = (
    <Modal
      open={open}
      onClose={() => handleClose()}
    >
      <Box sx={{ ...modalStyle, width: '700px' }} p={2}>
        <Box sx={{ ...flexColum, width: '100%' }}>
        <Typography variant="h6">Compartir salida</Typography>
          <Autocomplete
            multiple={true}
            fullWidth={true}
            sx={{ margin: '1rem 0', width: '700px' }}
            id="location-autocomplete"
            value={subjects}
            onChange={handleChange}
            options={emailList}
            getOptionLabel={(option) => option}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  key={option}
                  label={option}
                  {...getTagProps({ index })}
                  disabled={fixedOptions.indexOf(option) !== -1}
                />
              ))
            }
            style={{ width: '100%' }}
            renderInput={(params) => (
              <TextField
                fullWidth={true}
                {...params}
                placeholder="Añade contactos"
                sx={{
                  '.MuiFormHelperText-root' : {
                    fontSize: "0.92rem"
                  }}}
              />
            )}
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