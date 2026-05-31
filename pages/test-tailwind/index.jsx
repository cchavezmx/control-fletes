import { CardVehiclesTailwind } from '../../Components/CardVehiclesTailwind'

// Mock data para probar
const vehicleMock = {
  modelo: 'Toyota Hiace 2022',
  placas: 'ABC-123-CD',
  picture: null,
  is_active: true,
  expiration_verify: new Date('2026-12-15'),
  expiration_card: new Date('2026-06-30')
}

const vehicleMockInactive = {
  modelo: 'Nissan Versa 2020',
  placas: 'XYZ-789-ZW',
  picture: null,
  is_active: false,
  expiration_verify: null,
  expiration_card: null
}

export default function TestTailwindPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Test: CardVehicles con Tailwind</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardVehiclesTailwind vehicle={vehicleMock} />
        <CardVehiclesTailwind vehicle={vehicleMockInactive} />
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">Estado de la migración</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ Tailwind CSS instalado</li>
          <li>✅ Componentes shadcn/ui creados (Button, Card, Badge, Dialog, Sheet)</li>
          <li>✅ CardVehicles migrado a Tailwind</li>
          <li>✅ Colores INTECSA funcionando</li>
          <li>⏳ AppBar completo</li>
        </ul>
      </div>
    </div>
  )
}
