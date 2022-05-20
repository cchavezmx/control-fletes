import { useRouter } from 'next/router';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0'
import Appbar from './Appbar';
import { Container, Typography } from '@mui/material';

const ResponsiveAppBar = ({ children }) => {
  // const [anchorElNav, setAnchorElNav] = React.useState(null);
  // const [anchorElUser, setAnchorElUser] = React.useState(null);  

  const { user, error: errorUser, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (errorUser) return <div>{errorUser.message}</div>
  if (user) {
  return (
  <>
    <Appbar />
    <Container maxWidth="xl">
    <Typography>
      Bienvenido: {user?.name}
    </Typography>
      {children}
    </Container>
  </>
  );
  }

  return <></>
};

export default withPageAuthRequired(ResponsiveAppBar);