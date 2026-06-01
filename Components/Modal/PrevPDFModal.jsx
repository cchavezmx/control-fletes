/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { X, FileText, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API

const validTypes = {
  Traslado: 'traslado',
  Flete: 'flete',
  Renta: 'renta'
}

function PrevPDFModal ({ open, close, modalPreview }) {
  const { id, type } = modalPreview
  const [loading, setLoading] = useState(true)
  const [pdfPreview, setPdfPreview] = useState(null)

  const pdfCreator = async () => {
    await fetch(`${API}/flotilla/plan/print/${id}?type=${validTypes[type]}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    })
      .then(res => {
        res
          .arrayBuffer()
          .then(buffer => {
            const blob = new Blob([buffer], { type: 'application/pdf' })
            const URLpreview = URL.createObjectURL(blob)
            setPdfPreview(URLpreview)
          })
          .finally(() => setLoading(false))
      })
  }

  useEffect(() => {
    if (open) {
      setLoading(true)
      pdfCreator()
    }
  }, [open])

  useEffect(() => {
    function onKey (e) {
      if (e.key === 'Escape') close()
    }
    if (open) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close])

  return (
    <>
      <div className={`scrim${open ? ' show' : ''}`} onClick={close} />
      <div className={`sheet-right${open ? ' show' : ''}`}>
        <div className="sheet-head">
          <div className="sh-ic">
            <FileText size={20} />
          </div>
          <div>
            <div className="sh-folio">Vista previa del documento</div>
            <div className="sh-sub">{modalPreview.type} · Folio {modalPreview.id}</div>
          </div>
          <div className="spacer" />
          <button className="iconbtn-intecsa" onClick={close} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>
        <div className="sheet-body">
          {loading && (
            <div className="flex items-center justify-center h-full flex-col gap-3 text-[var(--muted)]">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-sm font-semibold">Cargando PDF…</span>
            </div>
          )}
          {!loading && pdfPreview && (
            <iframe
              src={pdfPreview}
              width="100%"
              height="100%"
              title="PDF Preview"
              style={{ border: 0, borderRadius: 8, background: '#fff' }}
              allowFullScreen
            />
          )}
          {!loading && !pdfPreview && (
            <div className="flex items-center justify-center h-full flex-col gap-2 text-[var(--danger)]">
              <X size={32} />
              <span className="text-sm font-semibold">No se pudo cargar el PDF</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PrevPDFModal
