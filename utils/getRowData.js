import dayjs from "dayjs";
import EMPRESAS from "../lib/empresas.json";

const formatDate = (date, time) => {
  const formatDate = new Date(date).toUTCString();
  if (!time) {
    return dayjs(formatDate).add(1, "day").format("DD/MM/YYYY");
  } else {
    return dayjs(formatDate).format("HH:mm a");
  }
};

const getBussinesCostName = (doc) => {
  const _client = doc.client;
  return EMPRESAS.find((empresa) => empresa._id === _client)?.name;
}

const getRowData = ({ documents }) => {
  const traslados =
    documents.traslado !== 0
      ? documents.traslado.map((document) => {
          return {
            ...document,
            id: document._id,
            bussiness_cost: getBussinesCostName(document),
            type: "Traslado",
            request_date: formatDate(document.request_date),
            delivery_date: formatDate(document.delivery_date),
            createdAt: formatDate(document.createdAt, "time"),
            modelo: document?.vehicle_info?.modelo,
          };
        })
      : [];

  const fletes =
    documents.fletes.length !== 0
      ? documents.fletes.map((document) => {
          return {
            ...document,
            id: document._id,
            type: "Flete",
            bussiness_cost: getBussinesCostName(document),
            request_date: formatDate(document.request_date),
            delivery_date: formatDate(document.delivery_date),
            createdAt: formatDate(document.createdAt, "time"),
            modelo: document?.vehicle_info?.modelo,
          };
        })
      : [];

  const rentas =
    documents.rentas.length !== 0
      ? documents.rentas.map((document) => {
          return {
            ...document,
            id: document._id,
            bussiness_cost: getBussinesCostName(document),
            type: "Renta",
            request_date: formatDate(document.request_date),
            delivery_date: formatDate(document.delivery_date),
            createdAt: formatDate(document.createdAt, "time"),
            modelo: document?.vehicle_info?.modelo,
          };
        })
      : [];

  return [...traslados, ...fletes, ...rentas];
};

export default getRowData;
