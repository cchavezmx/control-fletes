/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useState, useMemo } from 'react'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'
import PlansDrawer from './PlansDrawer'
import bussiness_cost_json from '../../utils/catalogov2.bussinesses.json'
import VechicleImageModal from './VechicleImageModal'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Truck, Eye, Search, X, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import z from 'zod'
import NewPlateModal from './NewPlateModal'
import DatePickerValue from './DatePickerValue'
import dayjs from 'dayjs'
const API = process.env.NEXT_PUBLIC_API

const badgeColors = {
  success: 'bg-green-100 text-green-800 border border-green-300',
  error: 'bg-red-100 text-red-800 border border-red-300'
}

const Badge = ({ label, color = 'success', onClick, className = '' }) => (
  <span
    onClick={onClick}
    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badgeColors[color] || badgeColors.success} ${className}`}
  >
    {label}
  </span>
)

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
    modal: false,
    data: {}
  })
  const openModalIMG = (params) => {
    setOpenVehicleModal({
      modal: true,
      data: params?.row || {}
    })
  }

  /* ─── Filtros ─── */
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos') // 'todos' | 'activo' | 'inactivo'
  const [typeFilter, setTypeFilter] = useState('todos')
  const [costCenterFilter, setCostCenterFilter] = useState('todos')
  const [seguroFilter, setSeguroFilter] = useState('todos')
  const [expirationsFilter, setExpirationsFilter] = useState('todos') // 'todos' | 'vencido' | 'proximo' | 'vigente'

  const today = dayjs()
  const in30Days = today.add(30, 'day')

  const vehicleTypes = useMemo(() => {
    const types = new Set(rows?.map(r => r.vehicle_type).filter(Boolean))
    return ['todos', ...Array.from(types)]
  }, [rows])

  const segurosList = useMemo(() => {
    const list = new Set(rows?.map(r => r.seguro || 'Qualitas').filter(Boolean))
    return ['todos', ...Array.from(list)]
  }, [rows])

  const hasExpired = (row) => {
    const dates = [
      row.expiration_card,
      row.expiration_verify,
      row.expiration_seguro
    ].filter(Boolean)
    return dates.some(d => dayjs(d).isBefore(today, 'day'))
  }

  const hasUpcoming = (row) => {
    const dates = [
      row.expiration_card,
      row.expiration_verify,
      row.expiration_seguro
    ].filter(Boolean)
    return dates.some(d => {
      const dt = dayjs(d)
      return dt.isAfter(today.subtract(1, 'day'), 'day') && dt.isBefore(in30Days.add(1, 'day'), 'day')
    })
  }

  function columnsFilter (data) {
    return (data || []).map((item) => ({
      id: item._id,
      seguro: 'Qualitas',
      ...item
    }))
  }

  const filteredRows = useMemo(() => {
    let result = columnsFilter(rows || [])

    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      result = result.filter(r =>
        (r.placas?.toLowerCase() || '').includes(q) ||
        (r.modelo?.toLowerCase() || '').includes(q) ||
        (r.serie?.toLowerCase() || '').includes(q) ||
        (r.motor?.toLowerCase() || '').includes(q)
      )
    }

    if (statusFilter !== 'todos') {
      result = result.filter(r =>
        statusFilter === 'activo' ? r.is_active : !r.is_active
      )
    }

    if (typeFilter !== 'todos') {
      result = result.filter(r => r.vehicle_type === typeFilter)
    }

    if (costCenterFilter !== 'todos') {
      result = result.filter(r => r.bussiness_cost === costCenterFilter)
    }

    if (seguroFilter !== 'todos') {
      result = result.filter(r => (r.seguro || 'Qualitas') === seguroFilter)
    }

    if (expirationsFilter !== 'todos') {
      if (expirationsFilter === 'vencido') {
        result = result.filter(r => hasExpired(r))
      } else if (expirationsFilter === 'proximo') {
        result = result.filter(r => hasUpcoming(r) && !hasExpired(r))
      } else if (expirationsFilter === 'vigente') {
        result = result.filter(r => !hasExpired(r) && !hasUpcoming(r))
      }
    }

    return result
  }, [rows, searchText, statusFilter, typeFilter, costCenterFilter, seguroFilter, expirationsFilter])

  const processRowUpdate = useCallback(
    async (newRow, oldRow) => {
      const changedField = Object.keys(newRow).find(
        (key) => newRow[key] !== oldRow[key]
      )
      if (changedField) {
        await handledUpdate({
          _id: newRow._id || newRow.id,
          [changedField]: newRow[changedField]
        })
      }
      return newRow
    },
    [handledUpdate]
  )

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
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
              className="w-[100px] h-[100px] object-scale-down object-center"
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
          <Badge
            color={params.row.is_active ? 'success' : 'error'}
            onClick={() => {
              setOpenPlanes({
                modal: true,
                data: params.row
              })
            }}
            label={params.row.is_active ? 'Activo' : 'Inactivo'}
          />
        )
      }
    },
    {
      field: 'bussiness_cost',
      headerName: 'Centro de Costo',
      sortable: false,
      width: 160,
      renderCell: (params) => {
        const defaultValue =
          Object.values(bussiness_cost_json).find((item) => {
            return item._id.$oid === params.row.bussiness_cost
          })?._id.$oid || ''
        return (
          <select
            className="w-full h-9 rounded border border-gray-300 bg-white px-2 text-sm"
            defaultValue={defaultValue}
            onChange={(e) => {
              handledUpdate({
                _id: params.row._id,
                bussiness_cost: e.target.value
              })
            }}
          >
            {bussiness_cost_json.map((item) => (
              <option key={item._id.$oid} value={item._id.$oid}>
                {item.slug.toUpperCase()}
              </option>
            ))}
          </select>
        )
      }
    },
    {
      field: 'planes',
      width: 150,
      headerName: 'Planes / Salidas',
      renderCell: (params) => {
        return (
          <Badge
            color="success"
            onClick={() => {
              setOpenPlanes({
                modal: true,
                data: params.row
              })
            }}
            className="gap-1"
          >
            <Eye className="h-3 w-3" />
            Ver planes
          </Badge>
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

  const clearFilters = () => {
    setSearchText('')
    setStatusFilter('todos')
    setTypeFilter('todos')
    setCostCenterFilter('todos')
    setSeguroFilter('todos')
    setExpirationsFilter('todos')
  }

  const activeFiltersCount = [
    statusFilter !== 'todos',
    typeFilter !== 'todos',
    costCenterFilter !== 'todos',
    seguroFilter !== 'todos',
    expirationsFilter !== 'todos',
    searchText.trim().length > 0
  ].filter(Boolean).length

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] w-full">
      <div className="flex justify-end gap-2 py-2">
        <Button
          onClick={() => setOpenModalPlate(true)}
          className="gap-2"
        >
          <Truck className="h-4 w-4" />
          Añadir
        </Button>
      </div>
      <Separator className="mb-2" />

      {/* ─── Filtros ─── */}
      <div className="bg-white border border-[var(--line)] rounded-[var(--r-md)] p-3 mb-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Búsqueda libre */}
          <div className="flex-1 min-w-[240px]">
            <label className="label-intecsa">Buscar</label>
            <div className="search-intecsa">
              <Search size={16} />
              <input
                type="text"
                placeholder="Placas, modelo, serie o motor…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button onClick={() => setSearchText('')} className="iconbtn-intecsa" style={{ width: 22, height: 22 }} type="button">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Estatus */}
          <div>
            <label className="label-intecsa">Estatus</label>
            <div className="flex gap-1">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'activo', label: 'Activo' },
                { key: 'inactivo', label: 'Inactivo' }
              ].map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={`chip-intecsa${statusFilter === chip.key ? ' on' : ''}`}
                  onClick={() => setStatusFilter(chip.key)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de vehículo */}
          <div className="min-w-[160px]">
            <label className="label-intecsa">Tipo de unidad</label>
            <select
              className="select-intecsa"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {vehicleTypes.map(t => (
                <option key={t} value={t}>{t === 'todos' ? 'Todos' : t}</option>
              ))}
            </select>
          </div>

          {/* Centro de costo */}
          <div className="min-w-[180px]">
            <label className="label-intecsa">Centro de costo</label>
            <select
              className="select-intecsa"
              value={costCenterFilter}
              onChange={(e) => setCostCenterFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              {bussiness_cost_json.map((item) => (
                <option key={item._id.$oid} value={item._id.$oid}>
                  {item.slug.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Aseguradora */}
          <div className="min-w-[160px]">
            <label className="label-intecsa">Aseguradora</label>
            <select
              className="select-intecsa"
              value={seguroFilter}
              onChange={(e) => setSeguroFilter(e.target.value)}
            >
              {segurosList.map(s => (
                <option key={s} value={s}>{s === 'todos' ? 'Todas' : s}</option>
              ))}
            </select>
          </div>

          {/* Vencimientos */}
          <div className="min-w-[180px]">
            <label className="label-intecsa">Vencimientos</label>
            <select
              className="select-intecsa"
              value={expirationsFilter}
              onChange={(e) => setExpirationsFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="vencido">⚠️ Vencidos</option>
              <option value="proximo">📅 Próximos (30 días)</option>
              <option value="vigente">✅ Vigentes</option>
            </select>
          </div>

          {/* Limpiar */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              className="btn-intecsa ghost"
              onClick={clearFilters}
              style={{ height: 42 }}
            >
              <X size={14} />
              Limpiar ({activeFiltersCount})
            </button>
          )}
        </div>

        {filteredRows.length !== (rows || []).length && (
          <p className="text-xs font-semibold text-[var(--muted)] mt-2">
            Mostrando <strong>{filteredRows.length}</strong> de {(rows || []).length} registros
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0">
      <DataGrid
        rows={filteredRows}
        columns={columns}
        localeText={esES}
        slots={{ toolbar: GridToolbar }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          },
          columns: {
            columnVisibilityModel: {
              id: false
            }
          }
        }}
        pageSizeOptions={[10, 20]}
        disableRowSelectionOnClick
        processRowUpdate={processRowUpdate}
      />
      </div>
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
    </div>
  )
}
