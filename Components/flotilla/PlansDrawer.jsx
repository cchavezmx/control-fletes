import { Drawer } from '@mui/material'
import PlanesDrawer from '../Modal/PlanesDrawer'
import { useMemo } from 'react'

export default function PlansDrawer ({ vehicle = {}, openMenu, setOpenMenu }) {
  const vh = useMemo(() => {
    if (!vehicle) {
      return {
        placas: '',
        modelo: ''
      }
    }

    return vehicle
  }, [vehicle])
  return (
  <>
  <Drawer
    anchor={'right'}
    open={openMenu}
    variant="temporary"
    sx={{
      width: '450px'
    }}
    onClose={() => setOpenMenu(false)}
  >
    <PlanesDrawer id={vh.placas} name={vh.modelo} closeDrawer={() => setOpenMenu(false)} />
    </Drawer>
  </>
  )
}
