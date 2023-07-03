/* eslint-disable camelcase */
import React, { useState, useRef } from 'react'
import { Typography, Box, Divider, Button, Container } from '@mui/material'
import NewDocument from '../Components/Modal/NewDocument'
import PrevPDFModal from '../Components/Modal/PrevPDFModal'
import { useRouter } from 'next/router'
import CancelModalDocument from '../Components/Modal/CancelModalDocument'
import { columnsDocumentosFlotillas as columns } from '../utils/columnsTables.js'
import ShareButton from '../utils/ShareButton'
import Link from 'next/link'
import TabPanel from '../Components/TabPanel'
import getRowData from '../utils/getRowData'

const validTypes = {
  Traslado: 'traslado',
  Flete: 'flete',
  Renta: 'renta'
}

function Empresa ({ empresa, documents, vehicles }) {
  console.log(process.env.NEXT_PUBLIC_VERCEL_URL, 'process.env.NEXT_PUBLIC_VERCEL_URL')

  const [selectedRow, setSelectedRow] = useState([])

  const [openNewModal, setOpenNewModal] = useState(false)
  const handledModal = (event) => setOpenNewModal(event)

  const router = useRouter()
  const { empresaId } = router.query
  const refreshData = () => {
    router.replace(empresaId)
  }

  const [modalPreview, setModalPreview] = useState(false)
  const handledPreviewDocument = ({ event, id = 0, type = 0 }) => {
    setModalPreview({
      open: event,
      id,
      type
    })
  }

  const useToggableRef = useRef()
  const handleCancelModal = () => {
    useToggableRef.current.showToggle()
  }

  return (
  <Container sx={{ position: 'relative' }} maxWidth="xl">
    <Typography variant='h3' sx={{ margin: '2.5rem 0', fontWeight: '500' }}>
      { empresa }
    </Typography>
    <Button
        sx={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          borderRadius: '9999px'
        }}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => handledModal(true)}
        >
          Nuevo
    </Button>
    <Typography>
      Rentas, Traslados y Fletes
    </Typography>
    <Divider />
    <Box sx={{ height: '80px', display: 'flex', alignItems: 'center' }}>
      {
        selectedRow.length === 1 && (
          <Box>{ ' ' }
            {
              selectedRow[0]?.isCancel_status
                ? null
                : (
                <>
                  <Button
                    onClick={() => {
                      handledPreviewDocument({
                        event: true,
                        id: selectedRow[0].id,
                        type: selectedRow[0].type
                      })
                    }}
                    variant="contained"
                    color="primary">
                      Vista Previa
                  </Button>{ ' ' }
                  <ShareButton
                    id={selectedRow[0].id}
                    type={validTypes[selectedRow[0].type]}
                    title={selectedRow[0].subject}
                  />
                  { ' ' }
                  <Button
                    variant="contained"
                    color="warning">
                    <Link passHref href={{
                      pathname: `/update/${selectedRow[0].id}`,
                      query: { type: selectedRow[0].type, currentEmpresa: empresa }
                    }}>
                      Modificar
                    </Link>
                  </Button>
                </>
                  )
            }
            { ' ' }
          <CancelModalDocument
            ref={useToggableRef}
            data={selectedRow[0]}
            refreshData={refreshData}
            >
            <Button
              onClick={handleCancelModal}
              variant="contained"
              color="error">
                { selectedRow[0]?.isCancel_status ? 'Ver motivo cancelación' : 'Cancelar documento' }
            </Button>
          </CancelModalDocument>
          </Box>
        )
      }
    </Box>
    <Divider />
    <Box>
      <TabPanel
        documents={documents}
        rows={getRowData({ documents })}
        columns={columns}
        setSelectedRow={setSelectedRow}
        refreshData={refreshData}
      />
    </Box>
    <Divider />
    <Box sx={{
      marginTop: '2.5rem'
    }}>
    </Box>
    <NewDocument
      listVehicles={vehicles}
      refreshData={refreshData}
      open={openNewModal}
      close={() => handledModal(false)}
      empresaId={documents._id}
    />
    {
      modalPreview.open && (
        <PrevPDFModal
          open={modalPreview.open}
          close={() => handledPreviewDocument({ event: false })}
          modalPreview={modalPreview}
        />
      )
    }
  </Container>
  )
}

export async function getServerSideProps (context) {
  const API = process.env.NEXT_PUBLIC_API
  const { empresaId, type } = context.query
  const documents = await fetch(`${API}/flotilla/documentos/${empresaId}?type=${type}`)
    .then(res => res.json())
    .then(({ documents }) => documents[0])

  const vehicles = await fetch(`${API}/flotilla/vehicles`)
    .then(res => res.json())
    .then(({ vehicles }) => {
      return vehicles.filter(({ is_active }) => is_active === true)
    })

  return {
    props: {
      empresa: documents.name,
      documents,
      vehicles
    }
  }
}

export default Empresa
