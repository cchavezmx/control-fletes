// disabled camelcase convention for this file
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'

const API = process.env.NEXT_PUBLIC_API

function OrderPage () {
  const params = useRouter()
  const { tracking_id, attemp_id } = params.query
  const [trackingId, setTrackingId] = useState(tracking_id)
  const [code, setCode] = useState('')
  const [attempId] = useState(attemp_id)
  const [shipping_code, setShippingCode] = useState(null)
  const [register, setRegister] = useState(null)

  const onChangeTrackingId = (e) => {
    setTrackingId(e.target.value)
  }

  const getTrackingId = useCallback(async () => {
    return fetch(`${API}/paqueteria/isvalid/${attempId}`)
  }, [attempId])

  useEffect(() => {
    getTrackingId()
      .then(res => res.json())
      .then(data => {
        setCode(data.message?.codigo)
        if (data.message?.shipping_code) {
          setShippingCode(data.message?.shipping_code)
        }
      })
  }, [trackingId, attempId, getTrackingId])

  const handledSubmit = async (e) => {
    e.preventDefault()
    const data = {
      id: attempId,
      shipping_code: trackingId
    }

    setRegister(false)
    fetch(`${API}/paqueteria/notify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then((data) => setRegister(data.message))
  }

  if (shipping_code) {
    return <h1>Esta guía ya fue registrada</h1>
  }

  if (register) {
    return <h1>Guía de paquetería registrada con éxito</h1>
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="py-4">
        <h2 className="text-center text-xl font-bold">Información de la orden</h2>
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold text-center my-8">
            Pedido Intecsa: <small>{code}</small>
          </h3>
          <form onSubmit={handledSubmit}>
            <div className="w-[300px] flex flex-col gap-3">
              <p className="text-base font-medium text-center">Confirmación de guía de paquetería</p>
              <p className="text-xs text-muted-foreground">Guía de seguimiento registrada</p>
              <input
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                value={trackingId}
                onChange={(e) => onChangeTrackingId(e)}
              />
              <Button type="submit" disabled={register !== null}>Confirmar guía</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderPage
