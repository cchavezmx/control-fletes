import * as React from 'react'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Autocomplete from '@mui/material/Autocomplete'

export default function VehiclesSelector ({ vehicleSelected, listVehicles, setVehicleSelected }) {
  console.log({ vehicleSelected, listVehicles })
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Autocomplete
        id="VehiclesSelector"
        freeSolo
        onChange={(e, value) => {
          if (!value) return setVehicleSelected('')
          const [placas] = value.split(' ')
          return setVehicleSelected(placas.trim())
        }}
        options={listVehicles.map((v) => `${v.placas} - ${v.modelo}`)}
        renderInput={(params) => <TextField {...params} label="Lista de Unidades" />}
      />
    </Stack>
  )
}
