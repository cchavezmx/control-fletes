import { useState } from 'react'
import { Card, Drawer, CardActions, CardContent, CardMedia, Button, Typography, Box } from '@mui/material'
import EditVeichle from './Modal/EditVehicle'
import PlanesDrawer from './Modal/PlanesDrawer'
import dayjs from 'dayjs'

export default function CardVehicles ({ vehicle }) {
  const [openEdit, setOpenEdit] = useState(false)
  const onClose = () => setOpenEdit(false)
  const isActive = vehicle.is_active ? '' : { opacity: '0.3', backgroundColor: '#a4b8c4' }

  const getDateLoco = (date) => {
    if (!date) {
      return dayjs(new Date()).format('DD/MM/YYYY')
    } else {
      return dayjs(date).add(1, 'day').format('DD/MM/YYYY')
    }
  }

  const [openMenu, setOpenMenu] = useState(false)

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
  <PlanesDrawer id={vehicle.placas} name={vehicle.modelo} closeDrawer={() => setOpenMenu(false)} />
  </Drawer>
    <EditVeichle data={vehicle} open={openEdit} close={onClose} />
    <Card sx={{ maxWidth: 345, ...isActive, boxShadow: 2 }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image={vehicle.picture ? vehicle.picture : 'img/7325069314.png'}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          { vehicle.modelo }
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="h6" color="text.secondary">
            Placas: {vehicle.placas}
          </Typography>
          <Typography variant="" color="text.secondary">
            { !vehicle.expiration_verify
              ? <small style={{ color: 'red' }}>Configura el vencimiento</small>
              : <span>Vencimiento Verificación: { getDateLoco(vehicle.expiration_verify) }</span>
            }
          </Typography>
          <Typography variant="" color="text.secondary">
            { !vehicle.expiration_card
              ? <small style={{ color: 'red' }}>Configura el vencimiento</small>
              : <span>Vencimiento Tarjeta: { getDateLoco(vehicle.expiration_card) }</span>
            }
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => setOpenEdit(true)}
          > Editar
        </Button>
        <Button
          size="small"
          onClick={() => setOpenMenu(true)}
          > VER PLANES
        </Button>
      </CardActions>
    </Card>
  </>
  )
}
