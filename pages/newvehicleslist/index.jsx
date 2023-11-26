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
    .then(res => res.json())
    .then(({ vehicles }) => vehicles)

  return {
    props: {
      vehicles
    }
  }
}

// {
//   "is_active": true,
//   "_id": "6275619fead4d600165cefeb",
//   "placas": "5936CJ",
//   "modelo": "CHEVROLET C3500",
//   "bussiness_cost": "626e22ebfe9887654db63c38",
//   "createdAt": "2022-05-06T17:57:51.741Z",
//   "updatedAt": "2022-06-14T00:58:17.702Z",
//   "__v": 0,
//   "picture": "https://itacatalgo.appspot.com.storage.googleapis.com/flotillas/397d8fd7-7a6b-4d3e-b4fa-dcb16373daee.webp",
//   "expiration_card": null,
//   "expiration_verify": null
// }

// field: 'modelo',
// field: 'vehicle_type',
// field: 'serie',
// field: 'motor',
// field: 'seguro',
