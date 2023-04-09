import { useState } from 'react'
import { Box } from '@mui/material'
import MenuSistemas from '../../Components/MenuSistemas'
import ColumnaSistemas from '../../Components/Sistemas/ColumnaSistemas'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import EquipoDetail from '../../Components/Sistemas/EquipoDetails'

const InventrioIT = ({ inventario }) => {
  console.log({ inventario })
  const [current, setCurrent] = useState(0)
  const menu = [
    {
      id: 1,
      name: 'Regresar',
      icon: <KeyboardReturnIcon />,
      link: 'mantenimiento',
      color: '#3f51b5'
    }
  ]

  return (
    <Box sx={{
      display: 'flex=',
      flexDirection: 'column'
    }}>
    <MenuSistemas menu={menu} />
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '30% 70%',
      backgroundColor: '#f9f9f9'

    }}>
      {/* columna Mantenimiento */}
      <ColumnaSistemas
        data={inventario}
        columnTitle="Inventario"
        slug="inventarioti"
        sx={{ flexGrow: 1 }}
        setCurrent={setCurrent}
      />
      {/* columna de equipos */}
      <EquipoDetail id={current} />
    </Box>
    </Box>
  )
}

export async function getServerSideProps () {
  const API = process.env.NEXT_PUBLIC_API
  const documents = await fetch(`${API}/inventarioIT/get`)
    .then(res => res.json())
    .then(res => {
      return res.equipos
    })

  return {
    props: {
      inventario: documents
    }
  }
}

export default InventrioIT
