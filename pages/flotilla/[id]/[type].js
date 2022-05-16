import { useState, useEffect } from 'react';
import { Typography, Box, Divider, Button } from '@mui/material'
const API = process.env.NEXT_PUBLIC_API;

const PDFInvoice = ({ id, type }) => {

  const [pdfurl, setPdfurl] = useState('');
  const [loading, setLoading] = useState(false);

  const getPDFURL = async () => {
    setLoading(true);
    const response = await fetch(`${API}/flotilla/plan/print/${id}?type=${type}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    .then(res => {
      res
      .arrayBuffer()
      .then(buffer => {
        const blob = new Blob([buffer], { type: 'application/pdf' })
        const URLpreview = URL.createObjectURL(blob)
        setPdfurl(URLpreview)
      })
      .finally(() => setLoading(false))
    })    
  }

  useEffect(() => {
    getPDFURL()

    return () => {
      setPdfurl('')
    }
  }, [])
  
  return (
    <Box>
      {loading && <Typography variant="h5">Cargando...</Typography>}
      {!loading && 
        <iframe 
        src={pdfurl}
        width="100%"
        height="800px"
        title="PDF Preview"
        frameBorder="0"
        allowFullScreen            
      />
      }
    </Box>

  )

}

export async function getServerSideProps(context) {
  const { id, type } = context.query;

  return {
    props: {
      id,
      type,
    }
  }


}

export default PDFInvoice
