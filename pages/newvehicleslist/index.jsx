import { Stack } from '@mui/material'
import TableDocuments from '../../Components/flotilla/TableDocuments'
function NewVehiclesList ({ vehicles }) {
  return (
    <div>
      <Stack>
        <h1>Inventarios de Vehiculos</h1>
      </Stack>
      <TableDocuments data={vehicles} />
    </div>
  )
}

export default NewVehiclesList

export async function getServerSideProps (context) {
  const API = process.env.NEXT_PUBLIC_API
  const vehicles = await fetch(`${API}/flotilla/vehicles`)
    .then((res) => res.json())
    .then(({ vehicles }) => vehicles)

  return {
    props: {
      vehicles
    }
  }
}
