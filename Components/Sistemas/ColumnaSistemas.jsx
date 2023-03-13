import { Box, Card, Stack, TextField, Typography } from '@mui/material'

const ColumnaSistemas = ({ data, columnTitle, slug, sx }) => {
  const colorCard = {
    radioscelulares: '#3f51b5',
    Impresoras: '#f50057',
    Obras: '#00bfa5',
    inventarioti: '#fa8900'
  }

  return (
    <>
      <Box sx={{
        backgroundColor: '#f9f9f9',
        padding: '10px',
        marginTop: '10px',
        ...sx
      }}>
        <TextField type="text" placeholder="Buscar equipo" sx={{
          width: '100%'
        }} />
        <Typography variant="h5" component="h1" sx={{
          margin: '10px 0',
          backgroundColor: `${colorCard[slug]}`,
          color: '#fff',
          padding: '10px'
        }}>
          {columnTitle}
        </Typography>
        <section
          style={{
            overflowY: 'auto',
            height: '60vh'
          }}
        >
          {data.map((item, index) => {
            console.log('🚀 ~ file: index.jsx:14 ~ {fakeData.map ~ item:', item)
            return (
            <Card key={index} sx={{
              width: '100%',
              height: 'filt-content',
              margin: '10px 0',
              padding: '10px',
              borderLeft: `5px solid ${colorCard[slug]}`

            }}>
              <Box>
                <Stack direction="row">
                  <Typography variant="body1" marginBottom={1} fontSize={26} >
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
    </>
  )
}

export default ColumnaSistemas
