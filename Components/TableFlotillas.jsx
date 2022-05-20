import { DataGrid, GridToolbar, esES } from '@mui/x-data-grid';


export default function TableFlotillas({ columns, rows, setSelectedRow }) {
  const handleRowClick = ([row]) => {

    const rowSelected = rows.find(r => r._id === row)
    if (row) {
      setSelectedRow((prev) => {
        return [rowSelected, ...prev]
      });
      return
    }
    setSelectedRow([]);
  }
  
  return (
  <>   
    <div style={{ height:'70vh', width: '100%' }}>
      <DataGrid
        initialState={{
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }],
          },
        }}
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        rows={rows}
        columns={columns}
        pageSize={20}
        rowsPerPageOptions={[20]}
        checkboxSelection
        onSelectionModelChange={handleRowClick}
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </div>
  </>
  );
}