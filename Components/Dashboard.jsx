import CardsEmpresa from './CardsEmpresa'
import useSWR from 'swr'

const API = process.env.NEXT_PUBLIC_API
const noActiveEmpresas = ['62a75bbf9ec0343efa92406f']

function Dashboard () {
  const { data, error, isLoading } = useSWR(`${API}/flotilla/empresas/get`)
  
  if (isLoading) return <div className="p-8 text-center">Cargando Empresas...</div>
  if (error) return <div className="p-8 text-center text-destructive">Error: {error.message}</div>
  if (!data?.empresas) return <div className="p-8 text-center">No hay empresas</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Empresas</h1>
      <div className="flex flex-wrap justify-center gap-7 max-w-7xl mx-auto">
        {data.empresas
          .filter((empresa) => !noActiveEmpresas.includes(empresa._id))
          .map((empresa) => (
            <CardsEmpresa key={empresa._id} empresa={empresa} />
          ))
        }
      </div>
    </div>
  )
}

export default Dashboard
