import { DataGrid, GridToolbar, esES } from '@mui/x-data-grid';
import { Box } from '@mui/material';


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
    <Box sx={{ 
      height:'70vh', 
      width: '100%',
      '& .super-app-theme--Rejected': {
        bgcolor: '#bdc3c7',
        color: '#34495e',
        '&:hover': {
          bgcolor: '#bdc3c7'
        },
      },
    }}>
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
        getRowClassName={({ row }) => {
          return typeof row.isCancel_status === 'string' ? 'super-app-theme--Rejected' : ''
        }}
      />
    </Box>
  </>
  );
}