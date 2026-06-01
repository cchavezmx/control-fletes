import 'dayjs/locale/es-mx'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import Layout from '../Components/Layout'
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import { GlobalStateProvider } from '../context/GlobalContext'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

function MyApp ({ Component, pageProps }) {
  const router = useRouter()
  const excludedRoutes = [
    '/paqueterita',
    '/paqueterita/attempt/[paqueteria_id]',
    '/paqueterita/attempt/tracking_id/[attemp_id]/[tracking_id]',
    '/control-vehicular',
    '/flotilla/[id]/[type]'
  ] // Rutas públicas
  const isExcluded = excludedRoutes.includes(router.pathname)

  return (
    <>
      <ToastContainer />
      <UserProvider>
        {isExcluded
          ? (
            <div className="max-w-7xl mx-auto px-4">
              <Component {...pageProps} />
            </div>
            )
          : (
            <GlobalStateProvider>
              <Layout>
                <SWRConfig value={{ provider: () => new Map(), fetcher }}>
                  <Component {...pageProps} />
                </SWRConfig>
              </Layout>
            </GlobalStateProvider>
            )}
      </UserProvider>
    </>
  )
}

// Si necesitas cargar datos iniciales
MyApp.getInitialProps = async (appContext) => {
  let pageProps = {}
  const env = process.env.VERCEL_ENV

  if (env === 'preview') {
    pageProps = {
      user: {
        name: 'Carlos Chavez',
        email: 'cchavezmx@outlook.com'
      },
      env
    }
  }

  return { pageProps }
}

export default MyApp
