import { Container, Typography, Card } from '@mui/material'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API

const PlanesDrawer = ({ id, name }) => {
  console.log(id)
  const [loading, setLoading] = useState(true)
  const [planes, setPlanes] = useState([])
  const getVehicleBySlug = async (slug) => {
    const response = await fetch(`${API}/flotilla/planes/slug/${slug}`)
      .then(res => res.json())
      .then(({ planes }) => setPlanes(planes))
      .finally(() => setLoading(false))

    return response
  }

  useEffect(() => {
    getVehicleBySlug(id)
  }, [id])

  return (
    <Container fixed>
      <Typography variant="h4" marginTop={'20px'}>
        { name }
      </Typography>
      { loading ? <div>Loading...</div> : null }
      { !loading && planes.length === 0 &&
      (
        <Typography variant="h6" marginTop={'20px'}>
          No hay planes disponibles
        </Typography>
      )}
      {
        !loading && planes.length > 0 && (
          planes.map(plane => {
            return (
              <Card key={plane._id} sx={{ padding: '10px', border: '1px dashed grey' }}>
                <Typography variant="h6" marginTop={'20px'}>
                  { plane.planName }
                </Typography>
                <Typography variant="h6" marginTop={'20px'}>
                  { plane.planDescription }
                </Typography>

              </Card>
            )
          })
        )
      }
    </Container>
  )
}

export default PlanesDrawer
