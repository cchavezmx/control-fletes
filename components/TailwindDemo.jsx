// Componente demo para probar Tailwind + shadcn/ui junto a MUI existente
// Uso: Probar en cualquier página antes de migrar completamente

import * as React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@mui/material";
import { Car, Settings, Package, Menu, X } from "lucide-react";

// shadcn/ui components
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TailwindDemo() {
  const [inputValue, setInputValue] = React.useState("");
  const [selectValue, setSelectValue] = React.useState("");

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
            <Label>Tipo de Vehículo</Label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camion">Camión</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="moto">Motocicleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Dialog (Modal)</h2>
        <Dialog>
          <DialogTrigger asChild>
            <TwButton>Abrir Modal Demo</TwButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Acción</DialogTitle>
              <DialogDescription>
                Esto es un ejemplo de modal con Tailwind CSS y Radix UI.
                Puedes usar este componente para reemplazar los modales de MUI.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Contenido del modal aquí...</p>
            </div>
            <DialogFooter>
              <TwButton variant="outline">Cancelar</TwButton>
              <TwButton>Confirmar</TwButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <span>Componentes Button, Input, Card: OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Dialog: OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Select: OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>AppBar: En progreso</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente simple para separación
function Separator() {
  return <div className="h-px bg-border my-6" />;
}
