import { useState, useEffect } from 'react'
import { Typography, Box, AppBar } from '@mui/material'
import { } from '@auth0/nextjs-auth0'
const API = process.env.NEXT_PUBLIC_API

const PDFInvoice = ({ id, type }) => {
  const [pdfurl, setPdfurl] = useState('')
  const [loading, setLoading] = useState(false)

  const getPDFURL = async () => {
    setLoading(true)
    await fetch(`${API}/flotilla/plan/print/${id}?type=${type}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
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
  <>
  <AppBar />
    <Box>
      {loading && <Typography variant="h5">Cargando...</Typography>}
      {!loading &&
        <iframe
        src={pdfurl}
        width="100%"
        height="1200px"
        title="PDF Preview"
        frameBorder="0"
        allowFullScreen
      />
      }
    </Box>
  </>
  )
}

export async function getServerSideProps (context) {
  const { id, type } = context.query

  return {
    props: {
      id,
      type
    }
  }
}

export default PDFInvoice
