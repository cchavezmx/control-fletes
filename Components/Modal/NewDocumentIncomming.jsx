import { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
} from '@mui/material'
import { useGlobalState } from '../../context/GlobalContext';
import DocumentoRelacionado from './DocumentoRelacionado';

const NewDocumentIncomming = (
  { empresaId, refreshData, listVehicles = [] }
) => {

  const [state, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'right',
  })
  
    const { vertical, horizontal } = state
    const { lastDocumentsCreated } = useGlobalState();

    console.log(lastDocumentsCreated, 'lastDocumentsCreated')
    const [openModalRelacionado, setOpenModalRelacionado] = useState(false);

    useEffect(() => {
      if (lastDocumentsCreated.length > 0) {
        setState((prevState) => {
          return { ...prevState, open: true }
        })
      }

      setTimeout(() => {
        setState((prevState) => {
          return { ...prevState, open: false }
        })
      }, 8000)

      return () => {
        clearTimeout()
      }

    }, [lastDocumentsCreated])

    return (
    <>
      <Snackbar
        sx={{
          cursor: 'pointer',
        }}
        onClick={() => setOpenModalRelacionado(true)}
        anchorOrigin={{ vertical, horizontal }}
        open={state.open}
        onClose={() => console.log('close')}
        key={vertical + horizontal}
      >
       <Alert severity="info">Acabas de generar un documento, deseas ocupar los datos</Alert>
      </Snackbar>
      <DocumentoRelacionado 
        listVehicles={listVehicles}
        refreshData={refreshData}
        open={openModalRelacionado}
        close={() => setOpenModalRelacionado(false)}
        empresaId={empresaId}
        prevData={lastDocumentsCreated[0]}
      />
    </>
    )
}

export default NewDocumentIncomming
