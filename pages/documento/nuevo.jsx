import { useRouter } from 'next/router'
import DocumentWizard from '../../Components/DocumentWizard'

export default function NuevoDocumentoPage ({ empresa, vehicles }) {
  const router = useRouter()
  const { empresaId } = router.query

  const handleSaved = () => {
    // Volver a la página de la empresa
    router.push(`/${empresaId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <DocumentWizard
      empresaId={empresaId}
      listVehicles={vehicles}
      onCancel={handleCancel}
      onSaved={handleSaved}
    />
  )
}

export async function getServerSideProps (context) {
  const API = process.env.NEXT_PUBLIC_API
  const { empresaId } = context.query

  // Si no hay empresaId, redirigir al dashboard
  if (!empresaId) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const vehicles = await fetch(`${API}/flotilla/vehicles`)
    .then((res) => res.json())
    .then(({ vehicles }) => vehicles.filter(({ is_active }) => is_active === true))
    .catch(() => [])

  return {
    props: {
      vehicles
    }
  }
}
