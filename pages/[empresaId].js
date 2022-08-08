/* eslint-disable camelcase */
import React, { useState, useRef } from 'react'
import { Typography, Box, Divider, Button, Container } from '@mui/material'
import TableFlotillas from '../Components/TableFlotillas'
import NewDocument from '../Components/Modal/NewDocument'
import PrevPDFModal from '../Components/Modal/PrevPDFModal'
import { useRouter } from 'next/router'
// import NewDocumentIncomming from '../Components/Modal/NewDocumentIncomming';
import CancelModalDocument from '../Components/Modal/CancelModalDocument'
import dayjs from 'dayjs'
import { columnsDocumentosFlotillas as columns } from '../utils/columnsTables.js'
import ShareButton from '../utils/ShareButton'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0'

const validTypes = {
  Traslado: 'traslado',
  Flete: 'flete',
  Renta: 'renta'
}

const formatDate = (date, time) => {
  const formatDate = new Date(date).toUTCString()
  if (!time) {
    return dayjs(formatDate).add(1, 'day').format('DD/MM/YYYY')
  } else {
    return dayjs(formatDate).format('HH:mm a')
  }
}

function Empresa ({ empresa, documents, vehicles }) {
  const [selectedRow, setSelectedRow] = useState([])
  const getRowData = () => {
    const traslados = documents.traslado !== 0
      ? documents.traslado.map(document => {
        return {
          ...document,
          id: document._id,
          type: 'Traslado',
          request_date: formatDate(document.request_date),
          delivery_date: formatDate(document.delivery_date),
          createdAt: formatDate(document.createdAt, 'time')
        }
      })
      : []

    const fletes = documents.fletes.length !== 0
      ? documents.fletes.map(document => {
        return {
          ...document,
          id: document._id,
          type: 'Flete',
          request_date: formatDate(document.request_date),
          delivery_date: formatDate(document.delivery_date),
          createdAt: formatDate(document.createdAt, 'time')
        }
      })
      : []

    const rentas = documents.rentas.length !== 0
      ? documents.rentas.map(document => {
        return {
          ...document,
          id: document._id,
          type: 'Renta',
          request_date: formatDate(document.request_date),
          delivery_date: formatDate(document.delivery_date),
          createdAt: formatDate(document.createdAt, 'time')
        }
      })
      : []

    return [...traslados, ...fletes, ...rentas]
  }

  const [openNewModal, setOpenNewModal] = useState(false)
  const handledModal = (event) => setOpenNewModal(event)

  const router = useRouter()
  const refreshData = () => {
    router.replace(router.asPath)
  }

  const [modalPreview, setModalPreview] = useState(false)
  const handledPreviewDocument = ({ event, id = 0, type = 0 }) => {
    setModalPreview({
      open: event,
      id,
      type
    })
  }

  const { user } = useUser()
  console.log(user)

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
                    <Link href={{
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
      <TableFlotillas
        documents={documents}
        rows={getRowData()}
        columns={columns}
        setSelectedRow={setSelectedRow}
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
    {/* <NewDocumentIncomming
      listVehicles={vehicles}
      refreshData={refreshData}
      open={openNewModal}
      close={() => handledModal(false)}
      empresaId={documents._id}
    /> */}
  </Container>
  )
}

export async function getServerSideProps (context) {
  const API = process.env.NEXT_PUBLIC_API
  const { empresaId } = context.query
  const documents = await fetch(`${API}/flotilla/documentos/${empresaId}`)
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
