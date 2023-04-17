import { useState } from 'react'
import { Drawer, Button, Box, Typography, Divider } from '@mui/material'
import CreateSalidaTI from './CreateSalidaTI'
import { beautifyDate } from '../../utils/beautifyDate'

const style = {
  width: '400px',
  height: '100%',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  overflow: 'auto',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3
}

const AssignUserModal = ({ equipo, children, lastUser }) => {
  console.log(equipo.equipo)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Drawer
        sx={{
          width: '400px'
        }}
        open={open}
        onClose={() => setOpen(false)}
        anchor='right'
      >
      <Box sx={{ ...style }}>
        <Typography variant="h5" sx={{ textAlign: 'center', marginTop: '1rem', margin: '15px 0' }}>
          Asignar Usuario
        </Typography>
        <CreateSalidaTI equipo={equipo} />
        <Box
          sx={{
            margin: '35px 0',
            height: '80vh',
            overflow: 'auto'
          }}
        >
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            marginTop: '1rem'
          }}>
          Historial de asignaciones
        </Typography>
        {
            equipo.equipo.usuariosequipos.length > 0 &&
            equipo.equipo.usuariosequipos
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((user, index) => {
                return (
                <>
                  <Box key={user._id}
                  sx={{
                    borderRadius: '4px',
                    padding: '10px',
                    margin: '10px 0',
                    border: index === 0 ? '3px solid #56da5c' : '#fff',
                    backgroundColor: index === 0 ? '#56da5c' : '#fff'
                  }}>
                      <Typography variant="body2">Nombre: {user.nombre}</Typography>
                      <Typography variant="body2">Lugar de trabajo: {user.unidad}</Typography>
                      <Typography variant="body2">
                        {
                          Object.prototype.hasOwnProperty.call(user, 'responsiva')
                            ? (
                            <Button fullWidth variant='outlined' href={user.responsiva} target="_blank" rel="noreferrer">
                              Descargar Responsiva
                            </Button>
                              )
                            : (
                            <Button
                              fullWidth
                              color='error'
                              variant='contained'
                              >
                                Añadir Responsiva Firmada
                          </Button>
                              )

                          }
                      </Typography>
                      <small>Fecha de creación</small>
                      <Typography variant="body2" >{beautifyDate(user.createdAt)}</Typography>
                  </Box>
                  <Divider />
                </>
                )
              })
          }
        </Box>
      </Box>
      </Drawer>
      <Button
        sx={{
          marginLeft: '10px'
        }}
        onClick={() => setOpen(true)}
        variant="contained"
        color="primary"
        size="small">
          { children }
      </Button>
    </>
  )
}

export default AssignUserModal
