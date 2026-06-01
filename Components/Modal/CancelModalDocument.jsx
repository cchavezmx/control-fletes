/* eslint-disable react/display-name */
import { useState, useEffect } from 'react'
import { X, Ban, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'

const API = process.env.NEXT_PUBLIC_API

const REASONS = [
  'Cliente canceló',
  'Vehículo no disponible',
  'Error en captura',
  'Cambio de ruta',
  'Otro'
]

export default function CancelModalDocument ({ open, onClose, data, refreshData }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const isReadOnly = data?.isCancel_status

  useEffect(() => {
    if (open) {
      setReason(data?.isCancel_status || '')
    }
  }, [open, data])

  useEffect(() => {
    function onKey (e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const updateOrderSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    setSaving(true)
    await fetch(`${API}/flotilla/update/${data._id}?type=${data.type.toLowerCase()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isCancel_status: reason
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.message._id) {
          toast.success('Documento cancelado')
          refreshData()
          onClose()
        } else {
          toast.error(res.message)
        }
      })
      .finally(() => setSaving(false))
  }

  if (!open) return null

  return (
    <>
      <div className={`scrim${open ? ' show' : ''}`} onClick={onClose} />
      <div className={`dialog-center${open ? ' show' : ''}`}>
        <div className="dialog-body">
          <div className="dialog-ic">
            <Ban size={23} />
          </div>
          <h2>{isReadOnly ? 'Documento cancelado' : 'Cancelar documento'}</h2>
          <p>
            {isReadOnly
              ? 'Este documento ya fue cancelado. A continuación se muestra el motivo registrado.'
              : `¿Estás seguro de cancelar el documento ${data?.folio || ''}? Esta acción no se puede deshacer.`}
          </p>

          {isReadOnly && (
            <div className="readonly-note">
              <AlertTriangle size={16} />
              <span>Motivo de cancelación:</span>
            </div>
          )}

          {!isReadOnly && (
            <div className="reason-chips">
              {REASONS.map(r => (
                <button
                  key={r}
                  className={`rc${reason === r ? ' on' : ''}`}
                  onClick={() => setReason(r)}
                  type="button"
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <textarea
            className="input-intecsa"
            style={{ minHeight: 100, resize: 'vertical' }}
            placeholder={isReadOnly ? '' : 'Describe el motivo de la cancelación…'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            readOnly={isReadOnly}
          />
        </div>

        <div className="dialog-foot">
          <button className="btn-intecsa" onClick={onClose} type="button">
            {isReadOnly ? 'Cerrar' : 'Volver'}
          </button>
          {!isReadOnly && (
            <button
              className="btn-intecsa danger"
              onClick={updateOrderSubmit}
              disabled={!reason.trim() || saving}
              type="button"
            >
              {saving ? 'Guardando…' : 'Cancelar documento'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
