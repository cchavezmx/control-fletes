import { Stack, Button, Link } from '@mui/material'
import NuevoEquipoInventario from '../Sistemas/NuevoEquipoInventario'
import { useRouter } from 'next/router'

const MenuSistemas = ({ menu, itprincipal }) => {
  const { pathname } = useRouter()

  return (
    <Stack direction="row" sx={{
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: '1rem',
      gap: '10px'
    }}>
    {
      pathname === '/inventarioti' && (
        <NuevoEquipoInventario />
      )
    }
     {
       menu.map(menu => {
         return (
          <Button
            onClick={() => console.log('click')}
            key={menu.id}
            variant="contained"
            endIcon={menu.icon}
            sx={{
              backgroundColor: `${menu.color}`
            }}
          >
            <Link passHref href={menu.link} color='#fff' underline='none'>
              {menu.name}
            </Link>
          </Button>
         )
       })
     }
    {
      itprincipal && (
        <select className='select-filtro-sistemas'>
          <option value="volvo">Todos</option>
          <option value="saab">Persona</option>
          <option value="mercedes">Obra</option>
      </select>
      )
    }
    </Stack>
  )
}

export default MenuSistemas
