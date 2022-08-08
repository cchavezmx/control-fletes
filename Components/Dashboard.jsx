import { Container } from '@mui/material'
import CardsEmpresa from './CardsEmpresa'
import useSWR from 'swr'

const API = process.env.NEXT_PUBLIC_API
const noActiveEmpresas = ['62a75bab9ec0343efa92406e', '62a75bbf9ec0343efa92406f']

function Dashboard () {
  const { data } = useSWR(`${API}/flotilla/empresas/get`)
  return (
    <div>
      <h1>Empresas</h1>
      <Container maxWidth="lg" sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        gap: '1.75rem'
      }}>
        {
          data && data.empresas
            .filter((empresa) => !noActiveEmpresas.includes(empresa._id))
            .map((empresa) => <CardsEmpresa key={empresa._id} empresa={empresa} />)
        }
        {
          !data && <h2>Cargando Empresas...</h2>
        }
      </Container>
    </div>
  )
}

export default Dashboard
