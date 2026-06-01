import * as React from 'react'
import TableFlotillas from './TableFlotillas'
import { useRouter } from 'next/router'

function TabPanel ({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="p-6">{children}</div>
      )}
    </div>
  )
}

export default function FullWidthTabs ({
  documents,
  columns,
  rows,
  setSelectedRow
}) {
  const [value, setValue] = React.useState(0)

  const handleChange = (newValue) => {
    setValue(newValue)
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
    <div className="w-full bg-background">
      <div className="flex border-b">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            value === 0
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => { handleChange(0); normalDocuments() }}
        >
          Activos
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            value === 1
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => { handleChange(1); cancelDocuments() }}
        >
          Cancelados
        </button>
      </div>

      <TabPanel value={value} index={0}>
        <TableFlotillas
          documents={documents}
          rows={rows}
          columns={columns}
          setSelectedRow={setSelectedRow}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TableFlotillas
          documents={documents}
          rows={rows}
          columns={canceledColumns}
          setSelectedRow={setSelectedRow}
        />
      </TabPanel>
    </div>
  )
}
