import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

const foto = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fmotos.espirituracer.com%2Fmotodeldia%2Fhonda-cg-125%2F&psig=AOvVaw3PNlMUkVaKi6e2-_aWZmiL&ust=1653811106870000&source=images&cd=vfe&ved=0CAwQjRxqFwoTCKCCsM7cgfgCFQAAAAAdAAAAABAD'

export default function CardVehicles({ vehicle }) {
  console.log(vehicle)
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="img/7325069314.png"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          { vehicle.modelo }
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography variant="" color="text.secondary">
            Placas: {vehicle.placas}
          </Typography>
          <Typography variant="" color="text.secondary">
            Ultima Salida: {'codi'}
          </Typography>
          <Typography variant="" color="text.secondary">
            Ultimo Conductor: {'codi'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small">Editar</Button>
      </CardActions>
    </Card>
  );
}