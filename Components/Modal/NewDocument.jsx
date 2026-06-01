import { Sheet, SheetContent } from '@/components/ui/sheet'
import DocumentWizard from '../DocumentWizard'

export default function NewDocument ({ open, close, empresaId, refreshData, listVehicles = [] }) {
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="w-full max-w-[960px] overflow-y-auto">
        <DocumentWizard
          empresaId={empresaId}
          listVehicles={listVehicles}
          onCancel={close}
          onSaved={refreshData}
        />
      </SheetContent>
    </Sheet>
  )
}
