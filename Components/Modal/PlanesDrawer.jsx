import { Container, Typography, List, ListItem, ListItemText, Card } from '@mui/material'
import { useEffect, useState } from 'react'
import ModalUpdatePlan from './ModalUpdatePlans'

const API = process.env.NEXT_PUBLIC_API

const PlanesDrawer = ({ id, name }) => {
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

  const [open, setOpen] = useState({
    show: false,
    data: null
  })

  return (
    <Container fixed>
      <ModalUpdatePlan open={open.show} setOpen={setOpen} data={open.data} />
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
          planes.map(plan => {
            return (
              <List key={plan._id} component="nav" aria-label="mailbox folders">
                <Card elevation={1}>
                  <ListItem button onClick={() => setOpen({ show: true, data: plan })} >
                    <ListItemText primary={plan.planName} />
                  </ListItem>
                </Card>
              </List>
            )
          })
        )
      }
    </Container>
  )
}

export default PlanesDrawer
