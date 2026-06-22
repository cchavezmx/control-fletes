import * as React from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Menu,
  Home,
  Settings,
  Truck,
  Mailbox,
  UserCircle,
  MoreVertical,
  Bug
} from 'lucide-react'

const menuObject = [
  {
    name: 'Unidades',
    icon: Truck,
    link: 'newvehicleslist'
  },
  {
    name: 'ITA-Utils',
    icon: Settings,
    link: 'ita-utils'
  },
  {
    name: 'QA Board',
    icon: Bug,
    link: 'qa'
  }
]

export default function PrimarySearchAppBar () {
  const { user } = useUser()
  const router = useRouter()
  const { pathname } = router

  const [openSheet, setOpenSheet] = React.useState(false)

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
    <header style={{ backgroundColor: colorsTitle() }} className="text-white">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Sheet open={openSheet} onOpenChange={setOpenSheet}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1">
                <Link href="/" onClick={() => setOpenSheet(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Button>
                </Link>
                <Separator className="my-2" />
                {menuObject.map((menu, index) => (
                  <Link key={index} href={`/${menu.link}`} onClick={() => setOpenSheet(false)}>
                    <Button
                      variant={pathname === `/${menu.link}` ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-3"
                    >
                      <menu.icon className="h-5 w-5" />
                      <span>{menu.name}</span>
                    </Button>
                  </Link>
                ))}
                <Separator className="my-2" />
                <Link href="/shipping" onClick={() => setOpenSheet(false)}>
                  <Button
                    variant={pathname === '/shipping' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <Mailbox className="h-5 w-5" />
                    <span>Paquetería</span>
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-bold hidden sm:block">
            <Link href="/" className="hover:opacity-90">
              {namesTitle()}
            </Link>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                {user?.picture
                  ? (
                    <Image
                      src={user.picture}
                      alt="profile"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    )
                  : (
                    <UserCircle className="h-6 w-6" />
                    )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Bienvenido: {user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/api/auth/logout">
                <DropdownMenuItem>
                  Cerrar Sesión
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <MoreVertical className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Perfil</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
