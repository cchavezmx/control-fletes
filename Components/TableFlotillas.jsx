import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

export default function TableFlotillas ({ columns, rows, onSelectionChange, onRowClick, setSelectedRow }) {
  const handleSelectionChange = (ids) => {
    if (onSelectionChange) {
      onSelectionChange(new Set(ids))
    }
    if (setSelectedRow) {
      const [rowId] = ids
      const rowSelected = rows.find(r => r.id === rowId)
      if (rowId) {
        setSelectedRow([rowSelected])
        return
      }
      setSelectedRow([])
    }
  }

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] w-full">
      <div className="flex-1 min-h-0">
      <DataGrid
        initialState={{
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }]
          },
          pagination: {
            paginationModel: { pageSize: 20 }
          }
        }}
        localeText={esES}
        rows={rows}
        disableRowSelectionOnClick
        columns={columns}
        pageSizeOptions={[20]}
        checkboxSelection
        onRowSelectionModelChange={handleSelectionChange}
        onRowClick={(params) => onRowClick && onRowClick(params.row)}
        slots={{ toolbar: GridToolbar }}
        getRowClassName={(params) => {
          return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'red'
        }}
      />
      </div>
    </div>
  )
}
