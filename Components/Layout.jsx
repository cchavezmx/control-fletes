import * as React from 'react';
import Appbar from './Appbar';
import { Container } from '@mui/material';

const ResponsiveAppBar = ({ children }) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

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

  return (
  <>
    <Appbar />
    <Container maxWidth="xl">
      {children}
    </Container>
  </>
  );
};
export default ResponsiveAppBar;