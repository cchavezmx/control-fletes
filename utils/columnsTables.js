const columnsDocumentosFlotillas = [
  {
    field: 'id',
    headerName: 'ID',
    hide: true
  },
  {
    field: 'folio',
    headerName: 'Folio',
    width: 100,
  },
  {
    field: 'type',
    headerName: 'Tipo Documento',
    width: 200,
  },
  {
    field: 'request_date',
    headerName: 'Fecha Solicitud',
    width: 150,
    type: 'date',
  },
  {
    field: 'createdAt',
    headerName: 'Hora de Solicitud',
    width: 150,
    sortable: true,
  },
  {
    field: 'delivery_date',
    headerName: 'Fecha Disperción',
    width: 150,
    type: 'date',
  },
  {
    field: 'driver',
    headerName: 'Conductor',
    width: 200,
  },
  {
    field: 'vehicle',
    headerName: 'Vehiculo',
    width: 150,
  },
  // {
  //   field: 'project_id',
  //   headerName: 'Folio Proyecto',
  //   width: 150,
  //   sortable: false,
  // },
  {
    field: 'route',
    headerName: 'Ruta',
    width: 250,
    sortable: false,
  },
];

export {
  columnsDocumentosFlotillas
}