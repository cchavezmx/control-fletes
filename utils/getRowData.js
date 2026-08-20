import dayjs from "dayjs";
import EMPRESAS from "../lib/empresas.json";
import { parseDateLocal } from "../utils/formatDate";

const pad = (n) => String(n).padStart(2, '0')

const formatDate = (date) => {
  if (!date) return '—'
  const dt = parseDateLocal(date)
  if (!dt) return '—'
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`
}

const formatTime = (date) => {
  if (!date) return '—'
  return dayjs(new Date(date)).format("HH:mm a")
}

const getBussinesCostName = (doc) => {
  const _client = doc.client;
  return EMPRESAS.find((empresa) => empresa._id === _client)?.name;
}

// Un documento se considera cancelado cuando tiene un motivo en isCancel_status.
export const isDocCancelled = (doc) => Boolean(doc?.isCancel_status);

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
            createdAt: formatTime(document.createdAt),
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
            createdAt: formatTime(document.createdAt),
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
            createdAt: formatTime(document.createdAt),
            modelo: document?.vehicle_info?.modelo,
          };
        })
      : [];

  return [...traslados, ...fletes, ...rentas];
};

export default getRowData;
