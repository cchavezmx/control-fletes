// disabled camelcase convention for this file
// eslint-disable-next-line camelcase
import { useCallback, useEffect, useState } from 'react'
import {
  Container,
  Stack,
  Typography,
  TextField,
  FormHelperText,
  Button,
  Grid
} from '@mui/material'
import { useRouter } from 'next/router'

const API = process.env.NEXT_PUBLIC_API

function OrderPage () {
  const params = useRouter()
  // eslint-disable-next-line camelcase
  const { tracking_id, attemp_id } = params.query
  const [trackingId, setTrackingId] = useState(tracking_id)
  const [code, setCode] = useState('')
  const [attempId] = useState(attemp_id)
  // eslint-disable-next-line camelcase
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

  // eslint-disable-next-line camelcase
  if (shipping_code) {
    return <h1>Esta guía ya fue registrada</h1>
  }

  if (register) {
    return <h1>Guía de paquetería registrada con éxito</h1>
  }

  return (
    <Container >
      <Grid container spacing={3}>
        <Grid item>
          <h2 style={{ textAlign: 'center' }}>Información de la orden</h2>
          <Stack>
            <Stack>
              <Typography variant="h6" align="center" mb={8} gutterBottom>
                Pedido Intecsa: <small>{code}</small>
              </Typography>
            </Stack>
            <form onSubmit={handledSubmit}>
              <Stack width={300} gap={1}>
                <Typography variant="subtitle1" align="center" mb={2} gutterBottom>
                  Confirmación de guía de paquetería
                </Typography>
                <FormHelperText>Guía de seguimiento registrada</FormHelperText>
                <TextField id="standard-basic" value={trackingId} onChange={(e) => onChangeTrackingId(e)} />
                <Button variant="contained" color="primary" type="submit" disabled={register !== null}>
                  Confirmar guía
                </Button>
              </Stack>
            </form>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

export default OrderPage
