import { useMemo } from 'react'
import { Box, Button, Card, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import useSWR from 'swr'
// fakes datas

const EquipoDetail = ({ id }) => {
  const API = process.env.NEXT_PUBLIC_API
  const { data } = useSWR(`${API}/inventarioIT/find?equipo=${id}`)

  const lastUsuario = useMemo(() => {
    if (data?.equipo?.usuariosequipos?.length > 0) {
      return data.equipo.usuariosequipos[data.equipo.usuariosequipos.length - 1]
    }

    return null
  }, [data])

  if (!data) return <p>Loading...</p>
  if (!id) {
    return (
      <Box
        sx={{
          overflowY: 'auto',
          height: '20vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <Typography variant="h4" sx={{ textAlign: 'center', marginTop: '1rem' }}>
          Seleccione un equipo
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Box
        sx={{
          overflowY: 'auto',
          height: '100vh',
          border: '1px solid #ccc',
          borderRadius: '10px'
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
            <Image src={data?.equipo?.imagen} alt="Picture of the author" width={300} height={300} objectFit="scale-down" />
          </Box>
          <Stack>
            <Typography variant="h4" sx={{ textAlign: 'center', marginTop: '1rem' }}>
              { data?.equipo?.marca } / { data?.equipo?.modelo }
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '1rem' }}>
              Descripción
            </Typography>
            <Box sx={{
              textAlign: 'left'
            }}>
              <Typography variant="body1" sx={{ textAlign: 'left', marginTop: '1rem' }}>
                { Object.entries(data?.equipo?.descripcion).map(([item, index]) => {
                  return (
                    <Box key={id + index} sx={{
                      display: 'flex'
                    }}>
                      <p style={{ margin: '0', fontWeight: 'bold' }} key={index}>
                        {item}
                      </p>:&nbsp;
                      <p style={{ margin: '0' }} key={index}>
                        {index}
                      </p>
                    </Box>
                  )
                })}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Stack padding={1} sx={{
          textAlign: 'left'
        }}>
          <Typography variant="h6">
            Usuario Asigando: <span style={{ color: '#3f51b5' }}>{ lastUsuario && lastUsuario.nombre }</span>
          </Typography>
          <Typography variant="h6">
            Ubicación: <span style={{ color: '#3f51b5' }}>{
              data?.equipo?.ubicacion
            }</span>
          </Typography>
          <Typography variant="h6">
            MAC: <span style={{ color: '#3f51b5' }}>
              { data?.equipo?.mac }
            </span>
          </Typography>
          <Typography variant="h6">
            Fecha de compra: <span style={{ color: '#3f51b5' }}>
              { data?.equipo?.fechaCompra }
            </span>
          </Typography>
          <Typography variant="h6">
            Garantía: <span style={{ color: '#3f51b5' }}>
              { data?.equipo?.garantia }
            </span>
          </Typography>
        </Stack>
        <Stack direction="row" sx={{
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '1rem'

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
          {
            data?.equipo?.mantenimiento?.map((mantenimiento) => {
              return (
                <Card
                  key={mantenimiento._id}
                  sx={{
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
              )
            })
          }
        </Stack>
      </Box>

  </>
  )
}

export default EquipoDetail
