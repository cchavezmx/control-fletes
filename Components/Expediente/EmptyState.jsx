import { Inbox, Search } from 'lucide-react'

export function EmptyState ({ onNew }) {
  return (
    <div className="state-wrap">
      <div className="empty">
        <div className="ill"><Inbox size={62} strokeWidth={1.4} /></div>
        <h2>Aún no hay documentos</h2>
        <p>Cuando crees un Traslado, Flete o Renta, aparecerán aquí con su folio, estatus y vehículo asignado.</p>
        <button className="btn-intecsa primary lg" onClick={onNew}>
          Crear primer documento
        </button>
      </div>
    </div>
  )
}

export function NoResults ({ onClear }) {
  return (
    <div className="state-wrap">
      <div className="empty">
        <div className="ill"><Search size={56} strokeWidth={1.4} /></div>
        <h2>Sin resultados</h2>
        <p>No hay documentos que coincidan con los filtros actuales. Prueba ajustar el tipo, el vehículo o la búsqueda.</p>
        <button className="btn-intecsa" onClick={onClear}>Limpiar filtros</button>
      </div>
    </div>
  )
}
