import { useState } from 'react'
import dayjs from 'dayjs'
import { TextField } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import 'dayjs/locale/es-mx'

export default function DatePickerValue ({ day, handledUpdate, id, type }) {
  const [value, setValue] = useState(dayjs(day).format('YYYY-MM-DD'))

  const handleChange = (newValue) => {
    setValue(dayjs(newValue).format('YYYY-MM-DD'))
    handledUpdate({
      _id: id,
      [type]: new Date(dayjs(newValue).valueOf()).getTime()
    })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
       <DesktopDatePicker
          sx={{ height: 40, width: '100%' }}
          inputFormat="YYYY-MM-DD"
          value={value}
          onChange={handleChange}
          renderInput={(params) => <TextField {...params} />}
        />
    </LocalizationProvider>
  )
}
