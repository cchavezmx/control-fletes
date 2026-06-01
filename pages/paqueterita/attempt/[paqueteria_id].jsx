import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const BarcodeScannerComponent = dynamic(
  () => import('react-qr-barcode-scanner'),
  { ssr: false }
)

const WebcamCapture = () => {
  const router = useRouter()
  const [scannedCode, setScannedCode] = useState('')
  const { paqueteria_id } = router.query
  const saveCode = useCallback(() => {
    if (scannedCode) {
      const { text } = JSON.parse(scannedCode)
      router.push(`/paqueterita/attempt/tracking_id/${paqueteria_id}/${text}`)
    }
  }, [scannedCode, router, paqueteria_id])

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
    <div className="bg-[#160033] text-white w-full h-screen px-4">
      <div className="flex flex-col items-center pt-4">
        <h1 className="text-xl font-bold text-center">Registro de guía de paquetería</h1>
        <BarcodeScannerComponent
          width={'100%'}
          height={400}
          onUpdate={(err, result) => {
            handleScan(err, result)
          }}
        />
      </div>
      <div className="flex flex-col items-center mt-8">
        <p>Escanea el código de barras de la guía de paquetería</p>
      </div>
    </div>
  )
}

export default WebcamCapture
