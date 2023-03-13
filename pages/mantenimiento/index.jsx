import { Box, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuSistemas from '../../Components/MenuSistemas'
import ColumnaSistemas from '../../Components/Sistemas/ColumnaSistemas'
// fakes datas
import fakeData from './csvjson.json'
import fakeImpre from './mante_impre.json'
import fakeObras from './obra_equipos.json'

const Mantenimiento = () => {
  const menu = [
    {
      id: 1,
      name: 'Nueva Salida',
      icon: <AddCircleIcon />,
      link: '',
      color: '#FF8C00'
    },
    {
      id: 2,
      name: 'Inventario de equipos',
      icon: <Inventory2Icon />,
      link: 'inventarioti',
      color: '#483D8B'
    },
    {
      id: 3,
      name: 'Configuración',
      icon: <SettingsIcon />,
      link: '',
      color: '#696969'
    }
  ]

  return (
    <Box sx={{
      display: 'flex=',
      flexDirection: 'column'
    }}>
    <Typography variant='h5' sx={{ margin: '1rem 0' }}>
      Equipos en obra
    </Typography>
    <MenuSistemas menu={menu} itprincipal />
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      backgroundColor: '#f9f9f9'

    }}>
      {/* columna Mantenimiento */}
      <ColumnaSistemas
        data={fakeData}
        slug="radioscelulares"
        columnTitle="Radios y Celulares"
      />
      {/* columna Impresoras */}
      <ColumnaSistemas
        data={fakeImpre}
        slug="Impresoras"
        columnTitle="Impresoras"
      />
      {/* columna Obras */}
      <ColumnaSistemas
        data={fakeObras}
        slug="Obras"
        columnTitle="Computadoras"
      />
    </Box>
    </Box>
  )
}

export default Mantenimiento
