import CardsEmpresa from './CardsEmpresa'
import { Skeleton } from '@/components/ui/skeleton'
import useSWR from 'swr'
import { useState } from 'react'
import Banner from './Banner'

const API = process.env.NEXT_PUBLIC_API
const noActiveEmpresas = ['62a75bbf9ec0343efa92406f']

function Dashboard () {
  const { data } = useSWR(`${API}/flotilla/empresas/get`)
  const [showWelcome, setShowWelcome] = useState(true)
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Empresas</h1>
      <div className="max-w-7xl mx-auto px-4">
        {showWelcome && (
          <div style={{ marginBottom: 16 }}>
            <Banner
              variant="info"
              stripe
              onClose={() => setShowWelcome(false)}
              title="Bienvenido al nuevo módulo de documentos"
            >
              Ahora puedes crear Traslados, Fletes y Rentas con desglose de
              conceptos y revisión de unidad en un solo wizard. Selecciona una
              empresa para comenzar.
            </Banner>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-7">
          {
            data && data.empresas
              .filter((empresa) => !noActiveEmpresas.includes(empresa._id))
              .map((empresa) => <CardsEmpresa key={empresa._id} empresa={empresa} />)
          }
          {
            !data && Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-[400px] h-[180px] rounded-md bg-[#e0e0e0]"
              />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard
