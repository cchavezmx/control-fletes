// Componente demo para probar Tailwind + shadcn/ui junto a MUI existente
// COMPATIBLE CON REACT 17 - Sin @radix-ui/react-slot

import * as React from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@mui/material";
import { Car, Settings, Package } from "lucide-react";

// shadcn/ui components (versión React 17 compatible)
import { Button as TwButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function TailwindDemo() {
  const [inputValue, setInputValue] = React.useState("");
  const [selectValue, setSelectValue] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Button: MUI vs Tailwind</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">MUI Button:</p>
            <Button variant="contained" color="primary">
              MUI Primary
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tailwind Button:</p>
            <TwButton variant="logistica">
              Tailwind Logistica
            </TwButton>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sistemas:</p>
            <TwButton variant="sistemas">
              <Settings className="w-4 h-4 mr-2" />
              Sistemas
            </TwButton>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Inventario:</p>
            <TwButton variant="inventario">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </TwButton>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-4">Card Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarjeta de Vehículo</CardTitle>
              <CardDescription>Información del vehículo con shadcn/ui</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Placa:</span>
                  <Badge variant="logistica">ABC-123</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estado:</span>
                  <Badge variant="secondary">Activo</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <TwButton size="sm">Ver Detalle</TwButton>
            </CardFooter>
          </Card>

          <Card className="border-sistemas">
            <CardHeader>
              <CardTitle className="text-sistemas">Equipo TI</CardTitle>
              <CardDescription>Inventario de sistemas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Tipo:</span>
                  <Badge variant="sistemas">Laptop</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Asignado:</span>
                  <Badge variant="outline">Juan Pérez</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <TwButton variant="outline" size="sm">Editar</TwButton>
              <TwButton variant="sistemas" size="sm">Ver</TwButton>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Form Tailwind</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Vehículo</Label>
            <Input 
              id="name"
              placeholder="Ej. Camión F150"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Vehículo (Select nativo)</Label>
            <select
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecciona un tipo</option>
              <option value="camion">Camión</option>
              <option value="van">Van</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Dialog (Modal) Personalizado</h2>
        <TwButton onClick={() => setDialogOpen(true)}>
          Abrir Modal Demo
        </TwButton>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader>
            <DialogTitle>Confirmar Acción</DialogTitle>
            <DialogDescription>
              Modal custom para React 17. No usa Radix Dialog.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Contenido del modal aquí...</p>
          </div>
          <DialogFooter>
            <TwButton variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </TwButton>
            <TwButton onClick={() => setDialogOpen(false)}>
              Confirmar
            </TwButton>
          </DialogFooter>
        </Dialog>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Sheet (Drawer) Personalizado</h2>
        <TwButton variant="sistemas" onClick={() => setSheetOpen(true)}>
          Abrir Sidebar
        </TwButton>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Título del Sidebar</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <p>Contenido del sidebar...</p>
              <TwButton 
                variant="outline" 
                className="mt-4"
                onClick={() => setSheetOpen(false)}
              >
                Cerrar
              </TwButton>
            </div>
          </SheetContent>
        </Sheet>
      </section>

      <section className="bg-muted p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Estado de la Migración</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Configuración Tailwind: OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Variables de color INTECSA: OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Componentes React 17 compatibles: OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Migrar páginas restantes: Pendiente</span>
          </div>
        </div>
      </section>
    </div>
  );
}
