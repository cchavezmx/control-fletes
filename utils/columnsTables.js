const columnsDocumentosFlotillas = [
  {
    field: 'id',
    headerName: 'ID',
    hide: true
  },
  {
    field: 'folio',
    headerName: 'Folio',
    width: 100
  },
  {
    field: 'bussiness_cost',
    headerName: 'Cliente',
    width: 180
  },
  {
    field: 'type',
    headerName: 'Tipo Documento',
    width: 130
  },
  {
    field: 'subject',
    headerName: 'Asunto',
    width: 250,
    sortable: false
  },
  {
    field: 'request_date',
    headerName: 'Fecha Solicitud',
    width: 140
  },
  {
    field: 'delivery_date',
    headerName: 'Fecha Entrega',
    width: 140
  },
  {
    field: 'vehicle',
    headerName: 'Vehículo',
    width: 140,
    renderCell: (params) => (
      <span>{ params?.row?.vehicle || params?.row?.modelo || '' }</span>
    )
  },
  {
    field: 'isCancel_status',
    headerName: 'Estatus',
    width: 120,
    renderCell: (params) => (
      <span style={{ color: params.value ? '#d32f2f' : '#2e7d32', fontWeight: 600 }}>
        { params.value ? 'Cancelado' : 'Activo' }
      </span>
    )
  },
  {
    field: 'createdAt',
    headerName: 'Hora',
    width: 140,
    sortable: true
  }
]

export { columnsDocumentosFlotillas }
