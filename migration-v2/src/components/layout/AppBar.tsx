import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0";
import {
  Menu,
  Home,
  Car,
  Truck,
  Settings,
  MapPin,
  Monitor,
  Package,
  User,
  X,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuObject = [
  {
    name: "Editar Unidades",
    icon: Car,
    link: "/vehicles",
    hide: false,
  },
  {
    name: "Unidades (BETA)",
    icon: Truck,
    link: "/newvehicleslist",
    hide: false,
  },
  {
    name: "ITA-Utils",
    icon: Settings,
    link: "/ita-utils",
    hide: false,
  },
  {
    name: "Seguimiento",
    icon: MapPin,
    link: "/flotilla",
    hide: true,
  },
];

export default function AppBar() {
  const { user } = useUser();
  const router = useRouter();
  const { pathname } = router;
  const [openMenu, setOpenMenu] = React.useState(false);

  const getSectionTitle = () => {
    if (pathname === "/mantenimiento") return "Control Sistemas y Comunicaciones";
    if (pathname === "/inventarioti") return "Inventario TI";
    return "Logistica";
  };

  const getSectionColor = () => {
    if (pathname === "/mantenimiento")
      return "bg-sistemas text-white";
    if (pathname === "/inventarioti") return "bg-inventario text-white";
    return "bg-logistica text-white";
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full ${getSectionColor()}`}
    >
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Sheet open={openMenu} onOpenChange={setOpenMenu}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:mr-4 text-white hover:bg-white/20"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-6">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setOpenMenu(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              <Separator className="my-2" />

              {menuObject.map((menu, index) => (
                <Link
                  key={index}
                  href={menu.link}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    menu.hide
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => !menu.hide && setOpenMenu(false)}
                >
                  <menu.icon className="h-5 w-5" />
                  <span>{menu.name}</span>
                </Link>
              ))}

              <Separator className="my-2" />

              <Link
                href="/mantenimiento"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setOpenMenu(false)}
              >
                <Monitor className="h-5 w-5" />
                <span>Sistemas</span>
              </Link>

              <Link
                href="/shipping"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setOpenMenu(false)}
              >
                <Package className="h-5 w-5" />
                <span>Paqueteria</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo/Title - Hidden on mobile */}
        <Link href="/" className="hidden sm:flex items-center font-semibold text-lg">
          {getSectionTitle()}
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full text-white hover:bg-white/20"
              >
                {user.picture ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.picture} alt={user.name || ""} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/api/auth/logout"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
