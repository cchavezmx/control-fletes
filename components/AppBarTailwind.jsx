import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0";
import { 
  Menu, Home, Car, Truck, Settings, MapPin, 
  Monitor, Package, User, LogOut, X 
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const menuObject = [
  { name: "Editar Unidades", icon: Car, link: "/vehicles", hide: false },
  { name: "Unidades (BETA)", icon: Truck, link: "/newvehicleslist", hide: false },
  { name: "ITA-Utils", icon: Settings, link: "/ita-utils", hide: false },
  { name: "Seguimiento", icon: MapPin, link: "/flotilla", hide: true },
];

export default function AppBarTailwind() {
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
    if (pathname === "/mantenimiento") return "bg-sistemas text-white";
    if (pathname === "/inventarioti") return "bg-inventario text-white";
    return "bg-logistica text-white";
  };

  return (
    <header className={`sticky top-0 z-50 w-full ${getSectionColor()}`}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Sheet open={openMenu} onOpenChange={setOpenMenu}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:mr-4 text-white hover:bg-white/20"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="p-6">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </SheetClose>

              <Separator />

              {menuObject.map((menu, index) => (
                <SheetClose asChild key={index}>
                  <Link
                    href={menu.hide ? "#" : menu.link}
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                      menu.hide 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <menu.icon className="h-5 w-5" />
                    <span>{menu.name}</span>
                  </Link>
                </SheetClose>
              ))}

              <Separator />

              <SheetClose asChild>
                <Link
                  href="/mantenimiento"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors"
                >
                  <Monitor className="h-5 w-5" />
                  <span>Sistemas</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/shipping"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors"
                >
                  <Package className="h-5 w-5" />
                  <span>Paqueteria</span>
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Title */}
        <Link href="/" className="hidden sm:block font-semibold text-lg">
          {getSectionTitle()}
        </Link>

        {/* Spacer - push menu left, user right */}
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
                  <img
                    src={user.picture}
                    alt={user.name || ""}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/api/auth/logout" className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
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
