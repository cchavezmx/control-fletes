import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0'
import { 
  Menu, Home, Car, Truck, Settings, MapPin, 
  Monitor, Package, User, LogOut, X 
} from 'lucide-react'

// shadcn/ui
import { Button } from '../components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Separator } from '../components/ui/separator'

const menuObject = [
  { name: 'Editar Unidades', icon: Car, link: '/vehicles', hide: false },
  { name: 'Unidades (BETA)', icon: Truck, link: '/newvehicleslist', hide: false },
  { name: 'ITA-Utils', icon: Settings, link: '/ita-utils', hide: false },
  { name: 'Seguimiento', icon: MapPin, link: '/flotilla', hide: true },
]

export default function Appbar() {
  const { user } = useUser()
  const router = useRouter()
  const { pathname } = router
  const [openMenu, setOpenMenu] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const getSectionTitle = () => {
    if (pathname === '/mantenimiento') return 'Control Sistemas y Comunicaciones'
    if (pathname === '/inventarioti') return 'Inventario TI'
    return 'Logistica'
  }

  const getSectionColor = () => {
    if (pathname === '/mantenimiento') return 'bg-sistemas'
    if (pathname === '/inventarioti') return 'bg-inventario'
    return 'bg-logistica'
  }

  if (!user) return null

  return (
    <>
      {/* User Menu Dialog */}
      <Dialog open={userMenuOpen} onOpenChange={setUserMenuOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mi Cuenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <Link href="/api/auth/logout" passHref>
              <Button variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar Sheet */}
      <Sheet open={openMenu} onOpenChange={setOpenMenu}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-6">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={() => setOpenMenu(false)}
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Separator />

            {menuObject.map((menu, index) => (
              <Link
                key={index}
                href={menu.hide ? '#' : menu.link}
                onClick={() => !menu.hide && setOpenMenu(false)}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  menu.hide 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-muted'
                }`}
              >
                <menu.icon className="h-5 w-5" />
                <span>{menu.name}</span>
              </Link>
            ))}

            <Separator />

            <Link
              href="/mantenimiento"
              onClick={() => setOpenMenu(false)}
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors"
            >
              <Monitor className="h-5 w-5" />
              <span>Sistemas</span>
            </Link>

            <Link
              href="/shipping"
              onClick={() => setOpenMenu(false)}
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors"
            >
              <Package className="h-5 w-5" />
              <span>Paqueteria</span>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* AppBar */}
      <header className={`sticky top-0 z-50 w-full ${getSectionColor()} text-white`}>
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4 text-white hover:bg-white/20"
            onClick={() => setOpenMenu(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>

          {/* Title */}
          <Link href="/" className="hidden sm:block font-semibold text-lg">
            {getSectionTitle()}
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full text-white hover:bg-white/20"
            onClick={() => setUserMenuOpen(true)}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>
    </>
  )
}
