import CardVehicles from '../../Components/CardVehicles'

const Vehicles = ({ vehicles }) => {
  return (
    <><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10 px-4">
       {
         vehicles.map(vehicle => <CardVehicles key={vehicle._id} vehicle={vehicle} />)
       }
    </div>
    <footer className="h-20" />
  </>
  )
}

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

export default Vehicles
