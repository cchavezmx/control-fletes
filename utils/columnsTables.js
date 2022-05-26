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
  {
    field: 'route',
    headerName: 'Ruta',
    width: 250,
    sortable: false,
  },
  {
    field: 'recorrido_km',
    headerName: 'Recorrido (Km)',
    width: 150,
    hide: true,
  },
  {
    field: 'subtotal_travel',
    headerName: 'Subtotal',
    width: 100,
  },
  {
    field: 'fuel_amount',
    headerName: 'Carga de Gas $',
    width: 150,
  }
];

export {
  columnsDocumentosFlotillas
}