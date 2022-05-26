import { Button, Container } from '@mui/material';
import CardsEmpresa from './CardsEmpresa';
import useSWR from 'swr'

const API = process.env.NEXT_PUBLIC_API

function Dashboard(){  
  const { data } = useSWR(`${API}/flotilla/empresas/get`)  
  return (
    <div>
      <h1>Empresas</h1>
      <Container maxWidth="lg" sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignContent: 'flex-start',
        gap: '1rem',
      }}>
        {
          data && data.empresas.map((empresa) => <CardsEmpresa key={empresa._id} empresa={empresa} />)
        }
        {
          !data && <h2>Cargando Empresas...</h2>
        }
      </Container>
    </div>
  );
}



export default Dashboard;
