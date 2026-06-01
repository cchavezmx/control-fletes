import { Sheet, SheetContent } from '@/components/ui/sheet'
import PlanesDrawer from '../Modal/PlanesDrawer'
import { useMemo } from 'react'

export default function PlansDrawer ({ vehicle = {}, openMenu, setOpenMenu }) {
  const vh = useMemo(() => {
    if (!vehicle) {
      return {
        placas: '',
        modelo: ''
      }
    }
    return vehicle
  }, [vehicle])

  return (
    <Sheet open={openMenu} onOpenChange={() => setOpenMenu(false)}>
      <SheetContent side="right" className="w-[450px]">
        <PlanesDrawer id={vh.placas} name={vh.modelo} closeDrawer={() => setOpenMenu(false)} />
      </SheetContent>
    </Sheet>
  )
}
