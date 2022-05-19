import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import 'dayjs/locale/es-mx'
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
  overrides: {}
});

const fetcher = (...args) => fetch(...args).then(res => res.json())

function MyApp({ Component, pageProps }) {
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
}

export default MyApp
