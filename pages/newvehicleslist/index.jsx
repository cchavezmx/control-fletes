import TableDocuments from '../../Components/flotilla/TableDocuments'
function NewVehiclesList ({ vehicles }) {
  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-bold">Inventarios de Vehiculos</h1>
      </div>
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
