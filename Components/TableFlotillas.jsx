import { DataGrid } from '@mui/x-data-grid';


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
    <div style={{ height:'50vh', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={15}
        rowsPerPageOptions={[15]}
        checkboxSelection
        onSelectionModelChange={handleRowClick}
      />
    </div>
  </>
  );
}