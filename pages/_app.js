import 'dayjs/locale/es-mx'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@mui/material'
import Layout from '../Components/Layout';
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify';
import { GlobalStateProvider } from '../context/GlobalContext';
import { UserProvider } from '@auth0/nextjs-auth0';
import { esES } from '@mui/material/locale'

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway, Arial',
  },
  palette: {}, 
  overrides: {},
});

const fetcher = (...args) => fetch(...args).then(res => res.json())

function MyApp({ Component, pageProps }) {
  const invalidRoutes = ['flete', 'renta', 'traslado']
  if (!invalidRoutes.includes(pageProps.type)) {
    return (
      <ThemeProvider theme={theme}>
        <UserProvider>
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

export default MyApp
