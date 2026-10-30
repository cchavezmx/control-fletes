import { useEffect, useState } from 'react'
import { getUrlByName, addFile } from '../firebase/client'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

const ItaUtils = () => {
  const [catalogo, setCatalogo] = useState('')
  const [currentURL, setCurrentURL] = useState('')
  const [file, setFile] = useState(null)
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
    </div>
  )
}

export default ItaUtils
