import FormularioPaqueteria from '../../Components/paqueteria/Form'
import { Typography } from '@mui/material'

export default function Index () {
  return (
    <div>
      <Typography variant="h4" align="center" gutterBottom>
        Formulario de Paquetería Grupo Intecsa
      </Typography>
      <FormularioPaqueteria />
    </div>
  )
}
