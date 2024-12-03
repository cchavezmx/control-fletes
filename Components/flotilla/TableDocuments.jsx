/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from 'react'
import { Box, Button, Chip, Divider, Select, MenuItem } from '@mui/material'
import { DataGrid, GridToolbar, esES } from '@mui/x-data-grid'
import PlansDrawer from './PlansDrawer'
import bussiness_cost_json from '../../utils/catalogov2.bussinesses.json'
import VechicleImageModal from './VechicleImageModal'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0'
import z from 'zod'
import NewPlateModal from './NewPlateModal'
import DatePickerValue from './DatePickerValue'
const API = process.env.NEXT_PUBLIC_API

export default function TableDocuments ({ data: rows }) {
  const [openPlanes, setOpenPlanes] = useState({
    modal: false,
    data: []
  })

  const { user } = useUser()
  const router = useRouter()
  const handledUpdate = useCallback(
    async (params) => {
      await fetch(`${API}/flotilla/vehiculo/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...params, last_user_mod: user.name })
      })
        .then((res) => res.json())
        .then((res) => {
          if (res) {
            toast.success('Actualizado')
            router.replace(router.asPath)
            close()
          }
        })
        .catch(() => console.log('error'))
    },
    [router, user]
  )

  const [openModalPlate, setOpenModalPlate] = useState(false)
  const handledNewVehicle = useCallback(
    async (params) => {
      const schemaValidation = z.object({
        placas: z.string().min(3, 'Tienes que ingresar una placa valida')
      })

      const validation = schemaValidation.safeParse(params)
      if (!validation.success) {
        return toast.error(validation.error.errors[0].message)
      }
      await fetch(`${API}/flotilla/vehiculo/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...params, last_user_mod: user.name })
      })
        .then((res) => res.json())
        .then((res) => {
          if (res) {
            toast.success('Actualizado')
            router.replace(router.asPath)
            close()
          }
        })
        .catch(() => console.log('error'))
    },
    [router, user]
  )

  const [openVehicleModal, setOpenVehicleModal] = useState({
    midal: false,
    data: {}
  })
  const openModalIMG = (params) => {
    setOpenVehicleModal({
      modal: true,
      data: params?.row || {}
    })
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 90, hide: true },
    {
      field: 'modelo',
      headerName: 'Modelo / Nombre',
      width: 250,
      editable: true
    },
    {
      field: 'picture',
      headerName: 'Foto',
      width: 150,
      editable: true,
      renderCell: (params) => {
        return (
          <div>
            <img
              src={params.row.picture}
              onClick={() => openModalIMG(params)}
              alt="img"
              className="img-fluid-vehicle"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'scale-down',
                objectPosition: 'center'
              }}
            />
          </div>
        )
      }
    },
    {
      field: 'vehicle_type',
      headerName: 'Tipo',
      width: 150,
      editable: true
    },
    {
      field: 'placas',
      headerName: 'Placas',
      width: 150,
      editable: true
    },
    {
      field: 'serie',
      headerName: 'No. Serie',
      width: 150,
      editable: true
    },
    {
      field: 'motor',
      headerName: 'No. Motor',
      width: 150,
      editable: true
    },
    {
      field: 'is_active',
      headerName: 'Estatus',
      type: 'boolean',
      width: 110,
      renderCell: (params) => {
        return (
          <div>
            <Chip
              color={params.row.is_active ? 'success' : 'error'}
              onClick={function () {
                setOpenPlanes({
                  modal: true,
                  data: params.row
                })
              }}
              size="lg"
              variant="outlined"
              label={params.row.is_active ? 'Activo' : 'Inactivo'}
            />
          </div>
        )
      }
    },
    {
      field: 'bussiness_cost',
      headerName: 'Centro de Costo',
      sortable: false,
      width: 160,
      renderCell: (params) => {
        return (
          <Select
            labelId="bussiness_cost"
            id="bussiness_cost"
            sx={{ width: '100%' }}
            defaultValue={
              Object.values(bussiness_cost_json).find((item) => {
                return item._id.$oid === params.row.bussiness_cost
              })?._id.$oid || ''
            }
            label="Centro de Costo"
            onChange={(e) => {
              handledUpdate({
                _id: params.row._id,
                bussiness_cost: e.target.value
              })
            }}
          >
            {bussiness_cost_json.map((item) => {
              return (
                <MenuItem key={item._id.$oid} value={item._id.$oid}>
                  {item.slug.toUpperCase()}
                </MenuItem>
              )
            })}
          </Select>
        )
      }
    },
    {
      field: 'planes',
      width: 150,
      headerName: 'Planes / Salidas',
      renderCell: (params) => {
        return (
          <div>
            <Chip
              icon={<RemoveRedEyeIcon />}
              color="success"
              onClick={function () {
                setOpenPlanes({
                  modal: true,
                  data: params.row
                })
              }}
              size="lg"
              variant="solid"
              label="Ver planes"
            />
          </div>
        )
      }
    },
    {
      field: 'expiration_card',
      headerName: 'Exp. Tarjeta Circulación',
      width: 200,
      editable: true,
      renderCell: (params) => {
        return (
          <DatePickerValue
            day={params.row.expiration_card}
            handledUpdate={handledUpdate}
            id={params.row.id}
            type="expiration_card"
          />
        )
      }
    },
    {
      field: 'expiration_verify',
      headerName: 'Exp. Verificación',
      width: 200,
      editable: true,
      renderCell: (params) => {
        return (
          <DatePickerValue
            day={params.row.expiration_verify}
            handledUpdate={handledUpdate}
            id={params.row.id}
            type="expiration_verify"
          />
        )
      }
    },
    {
      field: 'expiration_seguro',
      headerName: 'Exp. Seguro',
      width: 200,
      editable: true,
      renderCell: (params) => {
        return (
          <DatePickerValue
            day={params.row.expiration_seguro}
            handledUpdate={handledUpdate}
            id={params.row.id}
            type="expiration_seguro"
          />
        )
      }
    },
    {
      field: 'seguro',
      headerName: 'Aseguradora',
      width: 200,
      editable: true
    },
    {
      field: 'factura_qty',
      headerName: 'Valor de Factura',
      width: 200,
      editable: true
    }
  ]

  const columnsFilter = (data) => {
    return data.map((item) => {
      return {
        id: item._id,
        seguro: 'Qualitas',
        ...item
      }
    })
  }

  return (
    <Box sx={{ height: '70vh', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '10px 0',
          gap: '10px'
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenModalPlate(true)}
          endIcon={<LocalShippingIcon />}
        >
          Añadir
        </Button>
      </Box>
      <Divider sx={{ marginBottom: '50px' }} />
      <DataGrid
        rows={columnsFilter(rows)}
        columns={columns}
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        components={{
          Toolbar: GridToolbar
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          }
        }}
        pageSize={10}
        rowsPerPageOptions={[20]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        onCellEditCommit={(params) => {
          handledUpdate({
            _id: params.id,
            [params.field]: params.value
          })
        }}
      />
      <PlansDrawer
        vehicle={openPlanes.data}
        openMenu={openPlanes.modal}
        setOpenMenu={setOpenPlanes}
      />
      <VechicleImageModal
        row={openVehicleModal.data || {}}
        openModal={openVehicleModal?.modal}
        close={() => setOpenVehicleModal({ modal: false, data: {} })}
      />
      <NewPlateModal
        open={openModalPlate}
        onClose={() => setOpenModalPlate(false)}
        handledNewVehicle={handledNewVehicle}
      />
    </Box>
  )
}
