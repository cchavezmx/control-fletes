import { Box, Button, Card, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import MenuSistemas from '../../Components/MenuSistemas'
import ColumnaSistemas from '../../Components/Sistemas/ColumnaSistemas'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import AddCircleIcon from '@mui/icons-material/AddCircle'
// fakes datas
import fakeData from '../../Components/Sistemas/csvjson.json'
import pcInventario from './pc_inventario.png'

const InventrioIT = () => {
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
        data={fakeData}
        columnTitle="Inventario"
        slug="inventarioti"
        sx={{ flexGrow: 1 }}
      />
        <Box
          sx={{
            overflowY: 'auto',
            height: '70vh'
          }}
        >
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            padding: '1rem'
          }}>
            <Box
              sx={{
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
                select: 1,
                borderRadius: '10px',
                margin: '1rem'
              }}
            >
              <Image src={pcInventario} alt="Picture of the author" width={300} height={300} objectFit="scale-down" />
            </Box>
            <Stack>
              <Typography variant="h4" sx={{ textAlign: 'center', marginTop: '1rem' }}>
                DELL OPTIPLEX 3040
              </Typography>
              <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '1rem' }}>
                Descripción
              </Typography>
              <Box>
                <Typography variant="body1" sx={{ textAlign: 'center', marginTop: '1rem' }}>
                  Procesador Intel Core i5-6500T 2.5GHz (6M Cache, hasta 3.1GHz) 4GB DDR4 500GB SATA 3.0 7200rpm Intel HD Graphics 530 Gigabit Ethernet 802.11ac + Bluetooth 4.2 Windows 10 Pro 64-bit
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stack padding={1}>
            <Typography variant="h6">
              Usuario Asigando: <span style={{ color: '#3f51b5' }}>Jorge</span>
            </Typography>
            <Typography variant="h6">
              Ubicación: <span style={{ color: '#3f51b5' }}>Oficina 1</span>
            </Typography>
            <Typography variant="h6">
              MAC: <span style={{ color: '#3f51b5' }}>
                00:00:00:00:00:00
              </span>
            </Typography>
            <Typography variant="h6">
              Fecha de compra: <span style={{ color: '#3f51b5' }}>
                01/01/2021
              </span>
            </Typography>
            <Typography variant="h6">
              Garantía: <span style={{ color: '#3f51b5' }}>
                01/01/2022
              </span>
            </Typography>
          </Stack>
          <Stack direction="row" sx={{
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <Typography variant="h4" sx={{ textAlign: 'center', marginTop: '1rem' }}>
              Historial de Mantenimiento
            </Typography>
            <Button endIcon={<AddCircleIcon />} variant="contained" sx={{
              height: '3rem'
            }}>
              Agregar
            </Button>
          </Stack>
          <Stack>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '8px'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
            <Card sx={{
              display: 'flex',
              justifyContent: 'space-around',
              margin: '1rem'
            }}>
              <Typography variant="h6">
                Fecha: <span style={{ color: '#3f51b5' }}>
                  01/01/2021
                </span>
              </Typography>
              <Typography variant="h6">
                Descripción: <span style={{ color: '#3f51b5' }}>
                  Cambio de disco duro
                </span>
              </Typography>
            </Card>
          </Stack>
        </Box>
    </Box>
    </Box>
  )
}

export default InventrioIT
