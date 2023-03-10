import { Box, Stack, Card, Typography, TextField, ListItemButton, ListItemText } from '@mui/material'
import Image from 'next/image'
import fakeData from './csvjson.json'
import fakeImpre from './mante_impre.json'
import fakeObras from './obra_equipos.json'

const Mantenimiento = () => {
  return (
    <Box sx={{
      display: 'flex=',
      flexDirection: 'column'
    }}>
    <Stack direction="row" sx={{
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
    <Stack direction="row">
      <ListItemButton sx={{
        marginTop: 1
      }}>
        <Image src="/new.svg" alt="logo" width={50} height={50} />
        <ListItemText sx={{ marginLeft: 1 }} primary="Nueva entrada" />
      </ListItemButton>
    </Stack>
      <form>
        <TextField type="text" placeholder="Buscar equipo" sx={{
          width: '300px'
        }} />
      </form>
    </Stack>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      backgroundColor: '#f9f9f9'

    }}>
      {/* columna Mantenimiento */}
      <Box sx={{
        backgroundColor: '#f9f9f9',
        padding: '10px',
        marginTop: '10px'
      }}>
        <Typography variant="h5" component="h1" sx={{
          margin: '10px 0',
          backgroundColor: '#3f51b5',
          color: '#fff',
          padding: '10px'
        }}>Mantenimiento</Typography>
        <section>
          {fakeData.map((item, index) => {
            console.log('🚀 ~ file: index.jsx:14 ~ {fakeData.map ~ item:', item)
            return (
            <Card key={index} sx={{
              width: '100%',
              height: '100%',
              margin: '10px 0',
              padding: '10px',
              borderLeft: '5px solid #3f51b5'

            }}>
              <Box>
                <Stack direction="row">
                  <Typography variant="h5" marginBottom={1}>
                    { item.equipo }
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" marginLeft={1}>
                    {item.serie}
                  </Typography>
                </Stack>
                {/* <p>{item.mante}</p> */}
                <Typography variant="body2" sx={{
                  color: '#3f51b5',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'

                }}>
                  {item.mante}
                </Typography>
                <Stack direction="row" gap="10px">
                  <p><span style={{ fontWeight: 'bold' }}>Fecha Entrada:</span> {item.dateRecepcion}</p>
                  <p><span style={{ fontWeight: 'bold' }}>Fecha Salida:</span> {item.dateSalida}</p>
                </Stack>
              </Box>
            </Card>
            )
          })}
        </section>
      </Box>
      <Box>
        {/* columna En Obra */}
      <Box sx={{
        backgroundColor: '#f9f9f9',
        padding: '10px',
        marginTop: '10px'
      }}>
        <Typography variant="h5" component="h1" sx={{
          margin: '10px 0',
          backgroundColor: '#d96867',
          color: '#fff',
          padding: '10px'
        }}>Impresoras</Typography>
        <section>
          {fakeImpre.map((item, index) => {
            console.log('🚀 ~ file: index.jsx:14 ~ {fakeData.map ~ item:', item)
            return (
            <Card key={index} sx={{
              width: '100%',
              height: '100%',
              margin: '10px 0',
              padding: '10px',
              borderLeft: '5px solid #d96867'

            }}>
              <Box>
                <Stack direction="row">
                  <Typography variant="h5" marginBottom={1}>
                    { item.equipo }
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" marginLeft={1}>
                    {item.serie}
                  </Typography>
                </Stack>
                {/* <p>{item.mante}</p> */}
                <Typography variant="body2" sx={{
                  color: '#3f51b5',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'

                }}>
                  {item.mante}
                </Typography>
                <Stack direction="row" gap="10px">
                  <p><span style={{ fontWeight: 'bold' }}>Fecha Entrada:</span> {item.dateRecepcion}</p>
                  <p><span style={{ fontWeight: 'bold' }}>Fecha Salida:</span> {item.dateSalida}</p>
                </Stack>
              </Box>
            </Card>
            )
          })}
        </section>
      </Box>
      </Box>
      <Box>
        {/* columna Impresora */}
      <Box sx={{
        backgroundColor: '#f9f9f9',
        padding: '10px',
        marginTop: '10px'
      }}>
        <Typography variant="h5" component="h1" sx={{
          margin: '10px 0',
          backgroundColor: '#60a542',
          color: '#fff',
          padding: '10px'
        }}>Equipos En Obra</Typography>
        <section>
          {fakeObras.map((item, index) => {
            console.log('🚀 ~ file: index.jsx:14 ~ {fakeData.map ~ item:', item)
            return (
            <Card key={index} sx={{
              width: '100%',
              height: '100%',
              margin: '10px 0',
              padding: '10px',
              borderLeft: '5px solid #60a542'

            }}>
              <Box>
                <Stack direction="row">
                  <Typography variant="h5" marginBottom={1}>
                    { item.equipo }
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" marginLeft={1}>
                    {item.serie}
                  </Typography>
                </Stack>
                {/* <p>{item.mante}</p> */}
                <Typography variant="body2" sx={{
                  color: '#3f51b5',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'

                }}>
                  {item.mante}
                </Typography>
                <Stack direction="row" gap="10px">
                  <p><span style={{ fontWeight: 'bold' }}>Fecha Entrada:</span> {item.dateRecepcion}</p>
                  <p><span style={{ fontWeight: 'bold' }}>Fecha Salida:</span> {item.dateSalida}</p>
                </Stack>
              </Box>
            </Card>
            )
          })}
        </section>
      </Box>
      </Box>
    </Box>
    </Box>
  )
}

export default Mantenimiento
