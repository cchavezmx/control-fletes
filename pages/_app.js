import 'dayjs/locale/es-mx'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { createTheme, ThemeProvider } from '@mui/material'
import Layout from '../Components/Layout'
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import { GlobalStateProvider } from '../context/GlobalContext'
import { UserProvider } from '@auth0/nextjs-auth0'
import { useRouter } from 'next/router'

const theme = createTheme({
  typography: {
    fontFamily: 'Barlow, Arial',
    fontSize: 16
  },
  palette: {},
  overrides: {}
})

const fetcher = (...args) => fetch(...args).then((res) => res.json())

function MyApp ({ Component, pageProps }) {
  const router = useRouter()
  const excludedRoutes = ['/paqueterita'] // Rutas públicas
  const isExcluded = excludedRoutes.includes(router.pathname)

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <UserProvider>
        {isExcluded
          ? (
            <Component {...pageProps} />
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
    </ThemeProvider>
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
