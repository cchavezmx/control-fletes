import { Box } from '@mui/material'
import CardVehicles from "../../Components/CardVehicles";

const Vehicles = ({ vehicles}) => {
  return (
  <>
    <Box
      sx={{
        display: "Grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
        marginTop: "2.5rem",
      }}
    
    >
       {
         vehicles.map(vehicle => <CardVehicles key={vehicle._id} vehicle={vehicle} />)
       }
    </Box>
    <footer style={{
      height: "5rem",
    }}>

    </footer>
  </>
  );
}

export async function getServerSideProps(context) {
  const API = process.env.NEXT_PUBLIC_API;
  const vehicles = await fetch(`${API}/flotilla/vehicles`)
  .then(res => res.json())
  .then(({ vehicles }) => vehicles)


  return {
    props: {
      vehicles
    }
  }
}

export default Vehicles;