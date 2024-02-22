import dayjs from 'dayjs'

const formatDate = (date, time) => {
  const formatDate = new Date(date).toUTCString()
  if (!time) {
    return dayjs(formatDate).add(1, 'day').format('DD/MM/YYYY')
  } else {
    return dayjs(formatDate).format('HH:mm a')
  }
}

const getRowData = ({ documents }) => {
  const traslados = documents.traslado !== 0
    ? documents.traslados.map(document => {
      return {
        ...document,
        id: document._id,
        type: 'Traslado',
        request_date: formatDate(document.request_date),
        delivery_date: formatDate(document.delivery_date),
        createdAt: formatDate(document.createdAt, 'time'),
        modelo: document?.vehicle_info?.modelo
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
        createdAt: formatDate(document.createdAt, 'time'),
        modelo: document?.vehicle_info?.modelo
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
        createdAt: formatDate(document.createdAt, 'time'),
        modelo: document?.vehicle_info?.modelo
      }
    })
    : []

  return [...traslados, ...fletes, ...rentas]
}

export default getRowData
