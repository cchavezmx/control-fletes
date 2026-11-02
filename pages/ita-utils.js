import { useEffect, useState, useRef } from 'react'
import { getUrlByName, addFile } from '../firebase/client'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { getStoredRates, setStoredRates, DEFAULT_RATES } from '../utils/costBreakdown'

const cleanDecimal = (v) => String(v ?? '').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')

const RateInput = ({ label, defaultValue, inputRef }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">{label}</label>
    <input
      type="text"
      inputMode="decimal"
      className="w-full h-10 rounded-md border border-gray-300 px-2 text-sm"
      defaultValue={defaultValue}
      ref={inputRef}
      onChange={(e) => {
        e.target.value = cleanDecimal(e.target.value)
      }}
    />
  </div>
)

const ItaUtils = () => {
  const [catalogo, setCatalogo] = useState('')
  const [currentURL, setCurrentURL] = useState('')
  const [file, setFile] = useState(null)
  const [rates, setRates] = useState(DEFAULT_RATES)

  const profitRef = useRef(null)
  const indirectRef = useRef(null)
  const ivaRef = useRef(null)
  const catalogRef = useRef(null)

  useEffect(() => {
    const stored = getStoredRates()
    setRates(stored)
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
      if (catalogRef.current) catalogRef.current.value = ''
      setFile(null)
    })
  }

  const saveRates = (event) => {
    event.preventDefault()
    const next = {
      profit_pct: Number(profitRef.current?.value ?? DEFAULT_RATES.profit_pct),
      indirect_pct: Number(indirectRef.current?.value ?? DEFAULT_RATES.indirect_pct),
      iva_rate: Number(ivaRef.current?.value ?? DEFAULT_RATES.iva_rate) / 100
    }
    setRates(next)
    setStoredRates(next)
    toast.success('Márgenes e impuestos actualizados')
  }

  const resetRates = (event) => {
    event.preventDefault()
    setRates(DEFAULT_RATES)
    setStoredRates(DEFAULT_RATES)
    if (profitRef.current) profitRef.current.value = DEFAULT_RATES.profit_pct
    if (indirectRef.current) indirectRef.current.value = DEFAULT_RATES.indirect_pct
    if (ivaRef.current) ivaRef.current.value = DEFAULT_RATES.iva_rate * 100
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
                ref={catalogRef}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                defaultValue=""
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
                  defaultValue={rates.profit_pct}
                  inputRef={profitRef}
                />

                <RateInput
                  label="Indirectos (%)"
                  defaultValue={rates.indirect_pct}
                  inputRef={indirectRef}
                />

                <RateInput
                  label="IVA (%)"
                  defaultValue={rates.iva_rate * 100}
                  inputRef={ivaRef}
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
