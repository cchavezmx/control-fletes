import { useEffect, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, TextField, Button, FormLabel, Select, InputLabel, MenuItem } from '@mui/material'
import { getUrlByName, addFile } from '../firebase/client'
import { toast } from 'react-toastify'

const ItaUtils = () => {
  const [catalogo, setCatalogo] = useState('')
  const [currentURL, setCurrentURL] = useState('')
  const [file, setFile] = useState(null)
  const handleChange = (event) => {
    event.preventDefault()
    setCatalogo(event.target.value)
  }

  useEffect(() => {
    const getURL = async () => {
      const url = await getUrlByName(catalogo)
      setCurrentURL(url)
    }
    getURL()
  }, [catalogo, currentURL])

  const actualizarPDF = (event) => {
    event.preventDefault()
    addFile(file, catalogo).then((res) => {
      toast.success(res)
      setCatalogo('')
      setFile(null)
      setFile('')
    })
  }

  return (
        <Box sx={{ marginTop: '5rem' }}>
            <Typography variant='h4' sx={{ marginBottom: '2rem' }}>Utilidades</Typography>
            {/* primer menu */}
          <Accordion>
            <AccordionSummary
              sx={{ backgroundColor: '#f2f2f2' }}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Actualizar catálogo</Typography>
              <Typography sx={{ marginLeft: 'auto' }}>Herramienta para cambiar el archivo de catálogo de página web</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <form>
                <Box sx={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', minWidth: '700px', gap: '10px' }}>
                <InputLabel id="demo-simple-select-label">Catálogo</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={catalogo}
                    label="Age"
                    onChange={handleChange}
                >
                    <MenuItem value={'abb-catalogo'}>ABB</MenuItem>
                    <MenuItem value={'canalizacion-catalogo'}>Canalización</MenuItem>
                    <MenuItem value={'onka-catalogo'}>Onka</MenuItem>
                </Select>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    { catalogo && currentURL && <a href={currentURL} target='_blank' rel='noreferrer'>
                        <Button variant='outlined' color='secondary'>Link actual</Button>
                    </a>}
                </Box>
                    <FormLabel htmlFor="file">Selecciona un archivo</FormLabel>
                    <TextField type="file" disabled={!catalogo} onChange={(e) => {
                      const file = e.target.files[0]
                      console.log(file.type === 'application/pdf')
                      if (file.type === 'application/pdf') {
                        setFile(file)
                      } else {
                        return toast.error('El archivo debe ser un PDF')
                      }
                    }}
                    />
                    <Button onClick={actualizarPDF} disabled={!file} type="submit" variant='contained'>Actualizar</Button>
                </Box>
                </form>
              </Box>
            </AccordionDetails>
          </Accordion>
          {/* <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>Accordion 2</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disabled>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3a-content"
              id="panel3a-header"
            >
              <Typography>Disabled Accordion</Typography>
            </AccordionSummary>
          </Accordion> */}
        </Box>
  )
}

export default ItaUtils
