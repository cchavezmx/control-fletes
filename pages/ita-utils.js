import { useEffect, useState, useCallback } from 'react'
import { getUrlByName, addFile } from '../firebase/client'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { getStoredRates, setStoredRates, DEFAULT_RATES } from '../utils/costBreakdown'

/**
 * Input de porcentaje con estado local para evitar que el foco salte
 * mientras el usuario escribe. Solo notifica el valor numérico al padre.
 */
const RateInput = ({ label, value, onChange, onBlur }) => {
  const [raw, setRaw] = useState(String(value ?? ''))

  useEffect(() => {
    setRaw(String(value ?? ''))
  }, [value])

  const handleChange = useCallback((e) => {
    const next = e.target.value
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1')
    setRaw(next)

    const num = next === '' ? 0 : Number(next)
    if (!Number.isNaN(num)) {
      onChange(num)
    }
  }, [onChange])

  const handleBlur = useCallback(() => {
    const num = raw === '' ? 0 : Number(raw)
    setRaw(String(num))
    onBlur?.(num)
  }, [raw, onBlur])

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        min={0}
        max={100}
        step="0.01"
        className="w-full h-10 rounded-md border border-gray-300 px-2 text-sm"
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  )
}

const ItaUtils = () => {
  const [catalogo, setCatalogo] = useState('')
  const [currentURL, setCurrentURL] = useState('')
  const [file, setFile] = useState(null)
  const [rates, setRates] = useState(DEFAULT_RATES)

  useEffect(() => {
    setRates(getStoredRates())
  }, [])

  const handleChange = (event) => {
    event.preventDefault()
    setCatalogo(event.target.value)
  }

  useEffect(() => {
    const getURL = async () => {
      const url = await getUrlByName(catalogo)
      setCurrentURL(url)
    }
    getURL()
  }, [catalogo, currentURL])

  const actualizarPDF = (event) => {
    event.preventDefault()
    addFile(file, catalogo).then((res) => {
      toast.success(res)
      setCatalogo('')
      setFile(null)
    })
  }

  const updateRate = (field, value) => {
    setRates(prev => ({ ...prev, [field]: value }))
  }

  const saveRates = (event) => {
    event.preventDefault()
    setStoredRates(rates)
    toast.success('Márgenes e impuestos actualizados')
  }

  const resetRates = (event) => {
    event.preventDefault()
    setRates(DEFAULT_RATES)
    setStoredRates(DEFAULT_RATES)
    toast.success('Márgenes e impuestos restablecidos')
  }

  return (
    <div className="mt-20">
      <h1 className="text-3xl font-bold mb-8">Utilidades</h1>

      <details className="border rounded-md mb-4 bg-[#f2f2f2]">
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
          <span className="font-medium">Actualizar catálogo</span>
          <span className="text-sm text-muted-foreground">Herramienta para cambiar el archivo de catálogo de página web</span>
          <ChevronDown className="h-4 w-4 shrink-0 ml-2"
          />
        </summary>
        <div className="p-4 bg-white">
          <form className="flex flex-col items-center">
            <div className="flex flex-col gap-3 w-full max-w-[700px] py-4">
              <label className="text-sm font-medium">Catálogo</label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                value={catalogo}
                onChange={handleChange}
              >
                <option value="">Selecciona...</option>
                <option value={'abb-catalogo'}>ABB</option>
                <option value={'canalizacion-catalogo'}>Canalización</option>
                <option value={'onka-catalogo'}>Onka</option>
              </select>

              <div className="flex justify-center">
                {catalogo && currentURL && (
                  <a href={currentURL} target="_blank" rel="noreferrer">
                    <Button variant="outline">Link actual</Button>
                  </a>
                )}
              </div>

              <label className="text-sm font-medium">Selecciona un archivo</label>
              <input
                type="file"
                disabled={!catalogo}
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file.type === 'application/pdf') {
                    setFile(file)
                  } else {
                    return toast.error('El archivo debe ser un PDF')
                  }
                }}
                className="w-full text-sm"
              />

              <Button
                onClick={actualizarPDF}
                disabled={!file}
                type="submit"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </div>
      </details>

      <details className="border rounded-md mb-4 bg-[#f2f2f2]">
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
          <span className="font-medium">Márgenes e impuestos</span>
          <span className="text-sm text-muted-foreground">Porcentajes por defecto del wizard de documentos</span>
          <ChevronDown className="h-4 w-4 shrink-0 ml-2" />
        </summary>
        <div className="p-4 bg-white">
          <form className="flex flex-col items-center" onSubmit={saveRates}>
            <div className="flex flex-col gap-4 w-full max-w-[700px] py-4">
              <p className="text-sm text-muted-foreground">
                Estos valores se cargan por defecto al crear un nuevo documento y afectan el cálculo del PDF.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RateInput
                  label="Utilidad (%)"
                  value={rates.profit_pct}
                  onChange={(v) => updateRate('profit_pct', v)}
                />

                <RateInput
                  label="Indirectos (%)"
                  value={rates.indirect_pct}
                  onChange={(v) => updateRate('indirect_pct', v)}
                />

                <RateInput
                  label="IVA (%)"
                  value={rates.iva_rate * 100}
                  onChange={(v) => updateRate('iva_rate', v / 100)}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={resetRates}>
                  Restablecer
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </div>
          </form>
        </div>
      </details>
    </div>
  )
}

export default ItaUtils
