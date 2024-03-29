import * as React from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

export default function CardsEmpresa ({ empresa }) {
  const { name } = empresa
  return (
    <Card
      sx={{ backgroundColor: '#f5f5f5' }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Grupo Intecsa
        </Typography>
        <Typography variant="h5" component="div" sx={{
          width: '400px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textTransform: 'uppercase'
        }}>
          {name}
        </Typography>
        <Typography sx={{ mb: 1.5, fontWeight: 'bold' }} color="text.secondary">
        </Typography>
        <Typography variant="body2">
        </Typography>
      </CardContent>
      <CardActions>
        <Link passHref href="/[empresaId]" as={`/${empresa._id}`}>
          <Button variant='contained' size="small">Detalles</Button>
        </Link>
      </CardActions>
    </Card>
  )
}
