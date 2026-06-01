import ShippingGrid from '../../Components/paqueteria/ShippingGrid'
import useSWR from 'swr'

export default function Shipping () {
  const API = process.env.NEXT_PUBLIC_API
  const { data } = useSWR(`${API}/paqueteria/get`)

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-8 mb-4">
        Solicitudes de paquetería
      </h1>
      <div>
        <ShippingGrid data={data?.message} />
      </div>
    </div>
  )
}
