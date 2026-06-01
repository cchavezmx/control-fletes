import { useState, useRef, useEffect } from 'react'
import { MoreVertical, FileText, Share2, Pencil, Ban } from 'lucide-react'

export default function RowMenu ({ doc, onAction, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc (e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const cancelled = doc.isCancel_status

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button className="iconbtn-intecsa rowact" onClick={() => setOpen(o => !o)} title="Acciones">
        <MoreVertical size={17} />
      </button>
      {open && (
        <div
          className="select-pop"
          style={{
            left: align === 'right' ? 'auto' : 0,
            right: align === 'right' ? 0 : 'auto',
            width: 184,
            top: 'calc(100% + 4px)'
          }}
        >
          <button className="select-opt" onClick={() => { onAction('pdf', doc); setOpen(false) }}>
            <FileText size={15} />Ver PDF
          </button>
          <button className="select-opt" onClick={() => { onAction('share', doc); setOpen(false) }}>
            <Share2 size={15} />Enviar
          </button>
          {!cancelled && (
            <button className="select-opt" onClick={() => { onAction('edit', doc); setOpen(false) }}>
              <Pencil size={15} />Editar
            </button>
          )}
          <div style={{ height: 1, background: 'var(--line)', margin: '5px 4px' }} />
          <button
            className="select-opt"
            style={{ color: 'var(--danger)' }}
            onClick={() => { onAction('cancel', doc); setOpen(false) }}
          >
            <Ban size={15} />{cancelled ? 'Ver motivo' : 'Cancelar'}
          </button>
        </div>
      )}
    </div>
  )
}
