import { useState } from 'react'
import dayjs from 'dayjs'
import { format } from 'date-fns'
// shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// Components
import EditVeichle from './Modal/EditVehicle'

export default function CardVehiclesTailwind ({ vehicle }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openPlans, setOpenPlans] = useState(false)
  const [openDocs, setOpenDocs] = useState(false)
  
  const isActive = vehicle.is_active
  
  const getDateLoco = (date) => {
    if (!date) {
      return dayjs(new Date()).format('DD/MM/YYYY')
    } else {
      return dayjs(date).add(1, 'day').format('DD/MM/YYYY')
    }
  }

  const isExpiredVerify = !vehicle.expiration_verify
  const isExpiredCard = !vehicle.expiration_card

  return (
    <>
      {/* Dialog para editar - usando el componente MUI existente */}
      <EditVeichle data={vehicle} open={openEdit} close={() => setOpenEdit(false)} />

      {/* Sheet para planes */}
      <Sheet open={openPlans} onOpenChange={setOpenPlans}>
        <SheetContent className="w-[450px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Planes de {vehicle.modelo}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <p>Placa: {vehicle.placas}</p>
            <Button 
              variant="outline" 
              onClick={() => setOpenPlans(false)}
              className="mt-4"
            >
              Cerrar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog para documentos */}
      <Dialog open={openDocs} onOpenChange={setOpenDocs}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Documentos de {vehicle.modelo}</DialogTitle>
            <DialogDescription>
              Placa: {vehicle.placas}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span>Documento de verificación:</span>
              <Badge variant={isExpiredVerify ? "destructive" : "logistica"}>
                {isExpiredVerify ? "Vencido" : "Vigente"}
              </Badge>
            </div>
            <Button 
              onClick={() => setOpenDocs(false)}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card principal TAILWIND */}
      <Card 
        className={`w-[345px] ${!isActive ? 'opacity-30 bg-slate-200' : ''}`}
      >
        {/* Imagen */}
        <div className="relative h-[140px] w-full overflow-hidden rounded-t-lg">
          <img
            src={vehicle.picture ? vehicle.picture : '/img/7325069314.png'}
            alt={vehicle.modelo}
            className="object-cover w-full h-full"
          />
          {!isActive && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2"
            >
              Inactivo
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{vehicle.modelo}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>Placas:</span>
            <Badge variant="logistica">{vehicle.placas}</Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Verificación */}
          <div className="flex flex-col gap-1">
            {isExpiredVerify ? (
              <span className="text-sm text-red-500 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Configura el vencimiento
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Verificación vence: <span className="font-medium">{getDateLoco(vehicle.expiration_verify)}</span>
              </span>
            )}
          </div>

          {/* Tarjeta */}
          <div className="flex flex-col gap-1">
            {isExpiredCard ? (
              <span className="text-sm text-red-500 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Configura el vencimiento
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Tarjeta vence: <span className="font-medium">{getDateLoco(vehicle.expiration_card)}</span>
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-4">
          <Button
            size="sm"
            onClick={() => setOpenEdit(true)}
            className="flex-1"
          >
            Editar
          </Button>
          
          <Button
            variant="sistemas"
            size="sm"
            onClick={() => setOpenPlans(true)}
            className="flex-1"
          >
            Ver Planes
          </Button>
          
          <Button
            variant="inventario"
            size="sm"
            onClick={() => setOpenDocs(true)}
            className="flex-1"
          >
            Documentos
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
