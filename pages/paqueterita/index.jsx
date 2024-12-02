import FormularioPaqueteria from './Form'
import { Typography } from '@mui/material'

export default function Index () {
  return (
    <div>
      <Typography variant="h4" align="center" gutterBottom>
        Formulario de Paquetería
      </Typography>
      <FormularioPaqueteria />
    </div>
  )
}
