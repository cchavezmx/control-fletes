import * as React from 'react';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0'
import Appbar from './Appbar';
import { Container, Typography } from '@mui/material';

const ResponsiveAppBar = ({ children }) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const { user, error: errorUser, isLoading } = useUser()

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  if (isLoading) return <div>Loading...</div>
  if (errorUser) return <div>{errorUser.message}</div>
  if (user) {
  return (
  <>
    <Appbar />
    <Container maxWidth="xl">
    <Typography>
      Bienvenido: {user.name}
    </Typography>
      {children}
    </Container>
  </>
  );
  }

  return <></>
};
export default withPageAuthRequired(ResponsiveAppBar);