import { Box, Card, Stack, TextField, Typography } from '@mui/material'

const ColumnaSistemas = ({ data, columnTitle, slug, sx, setCurrent }) => {
  console.log('🚀 ~ file: ColumnaSistemas.jsx:5 ~ ColumnaSistemas ~ data:', data)
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
        border: '1px solid #ccc',
        ...sx
      }}>
        {/* <TextField type="text" placeholder="Buscar equipo" sx={{
          width: '100%'
        }} /> */}
        <Typography variant="h5" component="h1" sx={{
          margin: '10px 0',
          backgroundColor: `${colorCard[slug]}`,
          color: '#fff',
          padding: '10px'
        }}>
          {columnTitle}
        </Typography>
        <Box
          sx={{
            overflowY: 'auto',
            height: '60vh',
            '&::-webkit-scrollbar': {
              width: 10,
              height: 10
            },
            '&::-webkit-scrollbar-track': {
              // backgroundColor: 'orange'
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 2
            }
          }}
        >
          {data.map((item, index) => {
            console.log('🚀 ~ file: ColumnaSistemas.jsx:52 ~ {data.map ~ item:', item)
            return (
            <Card key={index} sx={{
              width: '100%',
              height: 'filt-content',
              margin: '10px 0',
              padding: '10px',
              borderLeft: `5px solid ${colorCard[slug]}`

            }}>
              <Box sx={{ cursor: 'pointer' }} onClick={() => setCurrent(item._id)}>
                <Stack direction="row">
                  <Typography variant="body1" marginBottom={1} fontSize={26} >
                    {item?.nombre} - {item?.equipo?.type}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" marginLeft={1}>
                    {item?.equipo?.serie}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{
                  color: '#3f51b5',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'

                }}>
                  { `${item?.equipo?.marca} ${item?.equipo?.modelo}` }
                </Typography>
                <Stack direction="row" gap="10px" justifyContent="space-between">
                  <small>
                    <Typography variant="body2" >
                      { item?.unidad }
                    </Typography>
                  </small>
                  <small>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }} >
                    { item?.type }
                    </Typography>
                  </small>
                </Stack>
              </Box>
            </Card>
            )
          })}
        </Box>
      </Box>
    </>
  )
}

export default ColumnaSistemas
