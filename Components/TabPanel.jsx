import * as React from 'react'
import PropTypes from 'prop-types'
import SwipeableViews from 'react-swipeable-views'
import { useTheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TableFlotillas from '../Components/TableFlotillas'
import { useRouter } from 'next/router'

function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

function a11yProps (index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

export default function FullWidthTabs ({
  documents,
  columns,
  rows,
  setSelectedRow
}) {
  const theme = useTheme()
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index) => {
    setValue(index)
  }

  const router = useRouter()
  const cancelDocuments = () => {
    router.replace(router.query.empresaId + '?type=cancel')
  }

  const normalDocuments = () => {
    router.replace(router.query.empresaId)
  }

  const canceledColumns = [
    {
      field: 'id',
      headerName: 'ID',
      hide: false
    },
    {
      field: 'isCancel_status',
      headerName: 'Estatus',
      width: 350,
      hide: false
    },
    {
      field: 'folio',
      headerName: 'Folio',
      width: 100
    },
    {
      field: 'type',
      headerName: 'Tipo Documento',
      width: 150
    },
    {
      field: 'createdAt',
      headerName: 'Hora de Solicitud',
      width: 150,
      sortable: true
    }
  ]

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Activos" {...a11yProps(0)} onClick={() => normalDocuments()}/>
          <Tab label="Cancelados" {...a11yProps(1)} onClick={() => cancelDocuments()} />
          {/* <Tab label="Pendientes" {...a11yProps(2)} /> */}
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <TableFlotillas
            documents={documents}
            rows={rows}
            columns={columns}
            setSelectedRow={setSelectedRow}
          />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <TableFlotillas
              documents={documents}
              rows={rows}
              columns={canceledColumns}
              setSelectedRow={setSelectedRow}
            />
        </TabPanel>
      </SwipeableViews>
    </Box>
  )
}
