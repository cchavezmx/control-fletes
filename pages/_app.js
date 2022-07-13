import 'dayjs/locale/es-mx'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@mui/material'
import Layout from '../Components/Layout';
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify';
import { GlobalStateProvider } from '../context/GlobalContext';
import { UserProvider } from '@auth0/nextjs-auth0';

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway, Arial',
  },
  palette: {}, 
  overrides: {},
});

const fetcher = (...args) => fetch(...args).then(res => res.json())

function MyApp({ Component, pageProps }) {
  console.log('MyApp', process.env.NODE_ENV, pageProps)
  const { user } = pageProps
  const invalidRoutes = ['flete', 'renta', 'traslado']
  if (!invalidRoutes.includes(pageProps.type)) {
    return (
      <ThemeProvider theme={theme}>
        <UserProvider user={user}>
        <GlobalStateProvider>
          <Layout>
          <ToastContainer />
            <SWRConfig value={{ provider: () => new Map, fetcher }}>
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
  const env = process.env.NODE_ENV
  const pageProps = {
    user: {
      name: 'Carlos Chavez',
      email: 'cchavezmx@outlook.com'
    }, 
    env,
  }

  return { pageProps }

}


export default MyApp
