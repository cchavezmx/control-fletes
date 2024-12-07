import FormularioPaqueteria from '../../Components/paqueteria/Form'
import { Typography, AppBar, Toolbar, Stack } from '@mui/material'

export default function Index () {
  return (
    <Stack>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="body1" gutterBottom>
            Registro Paquetería Grupo Intecsa
          </Typography>
        </Toolbar>
      </AppBar>

      <FormularioPaqueteria />
    </Stack>
  )
}
