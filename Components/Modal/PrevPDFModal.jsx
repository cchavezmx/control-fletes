/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { 
  Modal,
  Box,
  Typography,
  Button
} from '@mui/material'


const API = process.env.NEXT_PUBLIC_API

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  width: '100%',
};

const validTypes = {
  'Traslado': 'traslado',
  'Flete': 'flete',
  'Renta': 'renta',
}

function PrevPDFModal({ open, close, modalPreview }) {

  // add cors to fetch
    const { id, type } = modalPreview
    console.log(id, type, 'duaLipa')
    const [loading, setLoading] = useState(null)
    const [pdfPreview, setPdfPreview] = useState(null)

    const pdfCreator = async () => {
      // preview pdf blob data
      await fetch(`${API}/flotilla/plan/print/${id}?type=${validTypes[type]}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      .then(res => {
        res
        .arrayBuffer()
        .then(buffer => {
          const blob = new Blob([buffer], { type: 'application/pdf' })
          const URLpreview = URL.createObjectURL(blob)
          console.log(URLpreview)
          setPdfPreview(URLpreview)
        })
        .finally(() =>  setLoading(false))
      })
      
    }

    useEffect(async() => {
      setLoading(true)
      await pdfCreator()
    },[])

  return(
    <Modal
    open={open}
    onClose={close}>
      <Box sx={{ ...style }}>
        <Button onClick={close} variant="contained">Cerrar</Button>
        {
          !loading && pdfPreview && 
          <iframe 
            src={pdfPreview}
            width="100%"
            height="800px"
            title="PDF Preview"
            frameBorder="0"
            allowFullScreen            
          />
        }
        {
          loading && <Typography variant='h3' sx={{ margin: '2.5rem 0', fontWeight: '500' }}>
            Cargando...
          </Typography>
        }
      </Box>
    </Modal>
  )

}

export default PrevPDFModal