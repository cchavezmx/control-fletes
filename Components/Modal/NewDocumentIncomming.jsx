import { useEffect, useState } from 'react'
import { useGlobalState } from '../../context/GlobalContext'
import DocumentoRelacionado from './DocumentoRelacionado'
import { toast } from 'react-toastify'

const NewDocumentIncomming = (
  { empresaId, refreshData, listVehicles = [] }
) => {
  const { lastDocumentsCreated } = useGlobalState()
  const [openModalRelacionado, setOpenModalRelacionado] = useState(false)

  useEffect(() => {
    if (lastDocumentsCreated.length > 0) {
      toast.info(
        'Acabas de generar un documento, ¿deseas ocupar los datos?',
        {
          onClick: () => setOpenModalRelacionado(true),
          autoClose: 8000
        }
      )
    }
  }, [lastDocumentsCreated])

  return (
    <DocumentoRelacionado
      listVehicles={listVehicles}
      refreshData={refreshData}
      open={openModalRelacionado}
      close={() => setOpenModalRelacionado(false)}
      empresaId={empresaId}
      prevData={lastDocumentsCreated[0]}
    />
  )
}

export default NewDocumentIncomming
