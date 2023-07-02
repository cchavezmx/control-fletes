import { Box, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuSistemas from '../../Components/MenuSistemas'
import ColumnaSistemas from '../../Components/Sistemas/ColumnaSistemas'
// fakes datas
// import fakeData from './csvjson.json'
// import fakeImpre from './mante_impre.json'
// import fakeObras from './obra_equipos.json'

import useSWR from 'swr'

const API = process.env.NEXT_PUBLIC_API

const Mantenimiento = () => {
  const { data, error } = useSWR(`${API}/inventarioIT/lastassignments`)
  console.log('🚀 ~ file: index.jsx:19 ~ Mantenimiento ~ data:', data)

  const menu = [
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
      Equipos activos en obra
    </Typography>
    <MenuSistemas menu={menu} itprincipal />
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)'

    }}>
      {/* columna Mantenimiento */}
      {
        data && (
          <ColumnaSistemas
            data={data.equipos}
            slug="radioscelulares"
            columnTitle="Radios y Celulares"
          />
        )
      }
      {/* columna Impresoras */}
      {/* <ColumnaSistemas
        data={fakeImpre}
        slug="Impresoras"
        columnTitle="Impresoras"
      /> */}
      {/* columna Obras */}
      {/* <ColumnaSistemas
        data={fakeObras}
        slug="Obras"
        columnTitle="Computadoras"
      /> */}
    </Box>
    </Box>
  )
}

export default Mantenimiento
