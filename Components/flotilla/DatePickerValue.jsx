import { useState } from 'react'
import dayjs from 'dayjs'
import { TextField } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import 'dayjs/locale/es-mx'

export default function DatePickerValue ({ day, handledUpdate, id, type }) {
  const initial = day ? dayjs(day) : dayjs()
  const [value, setValue] = useState(initial)

  const handleChange = (newValue) => {
    const d = dayjs(newValue)
    setValue(d)
    handledUpdate({
      _id: id,
      [type]: d.valueOf()
    })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
       <DesktopDatePicker
          sx={{ height: 40, width: '100%' }}
          format="YYYY-MM-DD"
          value={value}
          onChange={handleChange}
          slotProps={{ textField: { size: 'small' } }}
        />
    </LocalizationProvider>
  )
}
