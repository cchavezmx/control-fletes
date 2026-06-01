import { FileText, Share2, Pencil, Ban, X } from 'lucide-react'

export default function FloatingToolbar ({ selected, docs, onAction, onClear }) {
  const ids = [...selected]
  const single = ids.length === 1 ? docs.find(d => d.id === ids[0]) : null
  const cancelled = single && single.isCancel_status

  return (
    <div className={`float-toolbar${ids.length ? ' show' : ''}`}>
      <div className="ft-count">
        <span className="n tnum">{ids.length}</span>
        {ids.length === 1 ? 'seleccionado' : 'seleccionados'}
      </div>
      <div className="ft-sep" />
      {single ? (
        <>
          <button className="ft-btn" onClick={() => onAction('pdf', single)}>
            <FileText size={15} />Ver PDF
          </button>
          <button className="ft-btn" onClick={() => onAction('share', single)}>
            <Share2 size={15} />Enviar
          </button>
          {!cancelled && (
            <button className="ft-btn" onClick={() => onAction('edit', single)}>
              <Pencil size={15} />Editar
            </button>
          )}
          <button className="ft-btn danger" onClick={() => onAction('cancel', single)}>
            <Ban size={15} />{cancelled ? 'Ver motivo' : 'Cancelar'}
          </button>
        </>
      ) : (
        <>
          <button className="ft-btn" onClick={() => onAction('share-bulk', ids)}>
            <Share2 size={15} />Compartir lote
          </button>
          <button className="ft-btn danger" onClick={() => onAction('cancel-bulk', ids)}>
            <Ban size={15} />Cancelar lote
          </button>
        </>
      )}
      <button className="ft-close" onClick={onClear} title="Limpiar selección (Esc)">
        <X size={15} />
      </button>
    </div>
  )
}
