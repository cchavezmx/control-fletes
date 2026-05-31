import 'dayjs/locale/es-mx'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import { GlobalStateProvider } from '../context/GlobalContext'
import { UserProvider } from '@auth0/nextjs-auth0'
import { useRouter } from 'next/router'
import Layout from '../Components/Layout'

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
    <UserProvider>
      <ToastContainer />
      {isExcluded
        ? (
          <SWRConfig value={{ provider: () => new Map(), fetcher }}>
            <Component {...pageProps} />
          </SWRConfig>
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
  )
}

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
