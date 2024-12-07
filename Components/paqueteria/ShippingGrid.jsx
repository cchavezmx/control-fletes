import React from 'react'
import { DataGrid, GridToolbar, esES } from '@mui/x-data-grid'
import DatePickerValue from '../flotilla/DatePickerValue'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import bussines from '../../utils/catalogov2.bussinesses.json'
import { toast } from 'react-toastify'
import { useUser } from '@auth0/nextjs-auth0'
const API = process.env.NEXT_PUBLIC_API

const shippingFollowing = (params) => {
  const code = params.row.shipping_code
  const company = params.row.paqueteria
  const links = {
    fedex: `https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber=${code}`,
    estafeta: `https://rastreo.estafeta.com/Search/${code}`,
    dhl: `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${code}`,
    estrella: `https://www.estafeta.com/Seguimiento?rastreo=${code}`,
    cargo: `https://www.cargomex.com.mx/rastreo?tracking=${code}`,
    aeromexico: `https://www.aeromexpress.com.mx/rastreo?awb=${code}`
  }

  const label = 'Seguir Envío: ' + company.toUpperCase()
  let color = 'secondary'
  if (code === '' || typeof code === 'undefined') {
    color = 'error'
  }
  return (
    <a href={links[company]} target="_blank" rel="noreferrer">
      <Chip label={label} color={color} />
    </a>
  )
}

const generateInvoice = async (data) => {
  fetch('api/paqueteria', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify({ ...data })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Error al generar el PDF')
      }
      return res.blob() // Convertir la respuesta a un blob
    })
    .then((blob) => {
      const pdfURL = window.URL.createObjectURL(blob)
      window.open(pdfURL, '_blank')
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

const handledUpdate = async (params) => {
  return fetch(`${API}/paqueteria/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...params })
  })
    .then((res) => res.json())
    .then((res) => {
      if (res) {
        toast.success('Actualizado')
        return res
      }
    })
    .catch(() => console.log('error'))
}

function getProyecto (empresaEnvio) {
  const bussinesName = bussines.find((b) => b._id.$oid === empresaEnvio)
  return bussinesName?.name?.toUpperCase() || 'No'
}

const columns = [
  {
    filed: 'lastUpdate',
    headerName: 'Última Actualización',
    width: 200,
    hide: true
  },
  {
    field: 'createdAt',
    headerName: 'Creado',
    width: 100,
    renderCell: (params) => <span>{params.row.createdAt}</span>
  },
  {
    field: 'shipping_status',
    headerName: 'Estatus de Envío',
    width: 150,
    renderCell: (params) => {
      const colors = {
        Enviado: 'primary',
        'En Camino': 'warning',
        Entregado: 'success'
      }
      return (
        <Chip
          label={params.row.shipping_status}
          color={colors[params.row.shipping_status]}
        />
      )
    }
  },
  {
    field: 'print',
    headerName: '🖨️',
    width: 100,
    headerAlign: 'center',
    renderCell: (params) => (
      <Button variant="outlined" onClick={() => generateInvoice(params.row)}>
        Imprimir
      </Button>
    )
  },
  {
    field: 'shipping_date',
    headerName: 'Fecha de Envío',
    width: 200,
    editable: true,
    renderCell: (params) => (
      <DatePickerValue
        day={params.row.shipping_date}
        handledUpdate={handledUpdate}
        id={params.row.id}
        type="shipping_date"
      />
    )
  },
  {
    field: 'shipping_code',
    headerName: 'Código de Envío',
    width: 200,
    editable: true
  },
  {
    field: 'shipping_cost',
    headerName: 'Costo de Envío',
    width: 200,
    editable: true,
    getCellValue: (params) => parseInt(params.row.shipping_cost),
    renderCell: (params) =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(params.row.shipping_cost || 0)
  },
  {
    field: 'shipping_arrival_date',
    headerName: 'Fecha estimada de Llegada',
    width: 250,
    editable: true,
    renderCell: (params) => (
      <DatePickerValue
        day={params.row.shipping_arrival_date}
        handledUpdate={handledUpdate}
        id={params.row.id}
        type="shipping_arrival_date"
      />
    )
  },
  {
    field: 'proyecto',
    headerName: 'Proyecto / Obra',
    width: 350
  },
  {
    field: 'paqueteria',
    headerName: 'Paquetería',
    width: 250,
    renderCell: (params) => shippingFollowing(params)
  },
  { field: 'direccion', headerName: 'Dirección', width: 750 },
  { field: 'contacto', headerName: 'Contacto', width: 300 },
  { field: 'numeroContacto', headerName: 'Número de Contacto', width: 200 },
  { field: 'contacto_recibe', headerName: 'Remitente', width: 300 },
  {
    field: 'numeroContacto_recibe',
    headerName: 'Númnero de Remitente',
    width: 200
  },
  {
    field: 'empresaEnvio',
    headerName: 'Centro de Costo',
    width: 350
  }
]

export default function ShippingGrid ({ data = [] }) {
  const { user } = useUser()
  const rows =
    data.map((row) => ({
      ...row,
      lastUpdate: user.name,
      empresaEnvio: getProyecto(row.empresaEnvio)
    })) || []

  return (
    <div style={{ height: 600, width: '100%', marginTop: 30 }}>
      <DataGrid
        processRowUpdate={handledUpdate}
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        components={{
          Toolbar: GridToolbar
        }}
        rows={rows}
        columns={columns}
        pageSize={30}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </div>
  )
}
