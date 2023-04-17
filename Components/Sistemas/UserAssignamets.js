import { Typography } from '@mui/material'
import { useMemo } from 'react'
import AssignUserModal from '../Modal/AssignUserModal'

const UserAssignamets = ({ equipo }) => {
  const lastUsuario = useMemo(() => {
    if (equipo?.equipo?.usuariosequipos?.length > 0) {
      const [lastUser] = equipo.equipo.usuariosequipos
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return lastUser
    }

    return null
  }, [equipo])

  return (
    <div>
      <Typography variant="h6" sx={{
        display: 'flex',
        alignItems: 'center',
        margin: '30px 0'
      }}>
        Usuario Asigando: <span style={{ color: '#3f51b5' }}>{
          lastUsuario
            ? <AssignUserModal lastUser={lastUsuario.nombre} equipo={equipo}>{lastUsuario.nombre}</AssignUserModal>
            : <AssignUserModal equipo={equipo}>Sin Asignar</AssignUserModal>
        }</span>
      </Typography>
    </div>
  )
}

export default UserAssignamets
