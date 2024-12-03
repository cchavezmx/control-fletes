import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ShippingGrid from '../../Components/paqueteria/ShippingGrid'
import useSWR from 'swr'

export default function Shipping () {
  const API = process.env.NEXT_PUBLIC_API
  const { data } = useSWR(`${API}/paqueteria/get`)

  return (
    <div>
      <Typography variant="h4" align="center" mt={8} gutterBottom>
        Solicitudes de paquetería
      </Typography>
      <Stack>
        <ShippingGrid data={data?.message} />
      </Stack>
    </div>
  )
}
