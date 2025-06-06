import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import HomeIcon from '@mui/icons-material/Home'
import MailIcon from '@mui/icons-material/Mail'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MoreIcon from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import { useUser } from '@auth0/nextjs-auth0'
import Image from 'next/image'
import Link from 'next/link'
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText
} from '@mui/material'
import { useRouter } from 'next/router'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MarkunreadMailboxIcon from '@mui/icons-material/MarkunreadMailbox'

// const Search = styled('div')(({ theme }) => ({
//   position: 'relative',
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: alpha(theme.palette.common.white, 0.15),
//   '&:hover': {
//     backgroundColor: alpha(theme.palette.common.white, 0.25)
//   },
//   marginRight: theme.spacing(2),
//   marginLeft: 0,
//   width: '100%',
//   [theme.breakpoints.up('sm')]: {
//     marginLeft: theme.spacing(3),
//     width: 'auto'
//   }
// }))

const menuObject = [
  {
    name: 'Editar Unidades',
    icon: <DirectionsCarFilledIcon />,
    link: 'vehicles'
  },
  {
    name: 'Unidades (BETA)',
    icon: <LocalShippingIcon />,
    link: 'newvehicleslist'
  },
  {
    name: 'ITA-Utils',
    icon: <SettingsIcon />,
    link: 'ita-utils'
  },
  {
    name: 'Seguimiento',
    icon: <GpsFixedIcon />,
    link: 'flotilla',
    hide: true
  }
]

export default function PrimarySearchAppBar () {
  const { user } = useUser()
  const router = useRouter()
  const { pathname } = router

  const [anchorEl, setAnchorEl] = React.useState(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null)

  const [openMenu, setOpenMenu] = React.useState(false)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <Typography>Bienvenido: {user?.name}</Typography>
      </MenuItem>
      <Divider />
      <Link href="/api/auth/logout" passHref>
        <MenuItem onClick={handleMenuClose}>Cerrar Sesión</MenuItem>
      </Link>
    </Menu>
  )

  const menuSecciones = (
    <Drawer
      anchor={'left'}
      open={openMenu}
      variant="temporary"
      sx={{
        width: '300px'
      }}
      onClose={() => setOpenMenu(false)}
    >
      <Divider />
      <List>
        <ListItem button key={1}>
          <Link href="/" passHref>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={'Home'} />
            </ListItemButton>
          </Link>
        </ListItem>
        <Divider sx={{ marginTop: '2rem' }} />
        {menuObject.map((menu, index) => (
          <ListItem key={index}>
            <Link href={menu.link} passHref>
              <ListItemButton disabled={menu.hide}>
                <ListItemIcon>{menu.icon}</ListItemIcon>
                <ListItemText primary={menu.name} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
        <Divider />
        <ListItem>
          <Link href="mantenimiento" passHref>
            <ListItemButton>
              <ListItemIcon>
                <LaptopChromebookIcon />
              </ListItemIcon>
              <ListItemText primary={'Sistemas'} />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem>
          <Link href="shipping" passHref>
            <ListItemButton>
              <ListItemIcon>
                <MarkunreadMailboxIcon />
              </ListItemIcon>
              <ListItemText primary={'Paqueteria'} />
            </ListItemButton>
          </Link>
        </ListItem>
      </List>
    </Drawer>
  )

  const mobileMenuId = 'primary-search-account-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  )

  const namesTitle = () => {
    if (pathname === '/mantenimiento') {
      return 'Control Sistemas y Comunicaciones'
    }

    if (pathname === '/inventarioti') {
      return 'Inventario TI'
    }

    return 'Logistica'
  }

  const colorsTitle = () => {
    if (pathname === '/mantenimiento') {
      return '#461e59'
    }

    if (pathname === '/inventarioti') {
      return '#FF8C00'
    }

    return '#3f51b5'
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        color="secondary"
        sx={{
          backgroundColor: colorsTitle()
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => setOpenMenu(true)}
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <Link passHref href="/">
              <a>{namesTitle()}</a>
            </Link>
          </Typography>
          {/* <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar por empresa"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search> */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* <IconButton size="large" aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton> */}
            {/* <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {user?.picture
                ? (
                <Image
                  src={user.picture}
                  alt="profile"
                  width={40}
                  height={40}
                  objectFit="cover"
                  style={{ borderRadius: '9999px' }}
                />
                  )
                : (
                <AccountCircle />
                  )}
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {menuSecciones}
    </Box>
  )
}
