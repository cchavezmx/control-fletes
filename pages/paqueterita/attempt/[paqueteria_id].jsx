import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'

const BarcodeScannerComponent = dynamic(
  () => import('react-qr-barcode-scanner'),
  { ssr: false } // Deshabilita el SSR
)

const WebcamCapture = () => {
  const router = useRouter()
  const [scannedCode, setScannedCode] = useState('')
  // eslint-disable-next-line camelcase
  const { paqueteria_id } = router.query
  const saveCode = useCallback(() => {
    if (scannedCode) {
      const { text } = JSON.parse(scannedCode)
      // eslint-disable-next-line camelcase
      router.push(`/paqueterita/attempt/tracking_id/${paqueteria_id}/${text}`)
    }
  },
  // eslint-disable-next-line camelcase
  [scannedCode, router, paqueteria_id])

  useEffect(() => {
    saveCode()
  }, [scannedCode, saveCode])

  const handleScan = (err, result) => {
    if (err) {
      console.error(err)
      return
    }
    if (result) {
      setScannedCode((JSON.stringify(result)))
    }
  }

  return (
    <Container className='App' maxWidth="xl">
      <Stack alignItems="center" marginTop={1}>
        <Typography textAlign="center" variant='h5'>
          Registro de guía de paquetería
        </Typography>
        <BarcodeScannerComponent
          width={'100%'}
          height={400}
          onUpdate={(err, result) => {
            handleScan(err, result)
          }}
        />
      </Stack>
      <Stack alignItems="center" marginTop={4}>
        Escanea el código de barras de la guía de paquetería
      </Stack>
    </Container>
  )
}

export default WebcamCapture
