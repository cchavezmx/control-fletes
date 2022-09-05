import 'dayjs/locale/es-mx'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { createTheme, ThemeProvider } from '@mui/material'
import Layout from '../Components/Layout'
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import { GlobalStateProvider } from '../context/GlobalContext'
import { UserProvider } from '@auth0/nextjs-auth0'

const theme = createTheme({
  typography: {
    fontFamily: 'Barlow, Arial',
    fontSize: 16
  },
  palette: {},
  overrides: {}
})

const fetcher = (...args) => fetch(...args).then(res => res.json())

function MyApp ({ Component, pageProps }) {
  const { user } = pageProps
  console.log('🚀 ~ file: _app.js ~ line 24 ~ MyApp ~ user', user)
  const invalidRoutes = ['flete', 'renta', 'traslado']
  if (!invalidRoutes.includes(pageProps.type)) {
    return (
      <ThemeProvider theme={theme}>
        <UserProvider user={user}>
        <GlobalStateProvider>
          <Layout>
          <ToastContainer />
            <SWRConfig value={{ provider: () => new Map(), fetcher }}>
              <Component {...pageProps} />
            </SWRConfig>
          </Layout>
        </GlobalStateProvider>
        </UserProvider>
      </ThemeProvider>
    )
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
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
