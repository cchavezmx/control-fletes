import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function NewPlateModal ({ open, onClose, handledNewVehicle }) {
  const plateRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await handledNewVehicle({ placas: (plateRef.current?.value || '').trim(), picture: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png' })
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      onClose()
    }
  }

  useEffect(() => {
    return () => {
      if (plateRef.current) plateRef.current.value = ''
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center font-black">Nuevo vehiculo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Separator className="mb-4" />
          <div className="flex flex-col items-center gap-4">
            <input
              ref={plateRef}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
              placeholder="ABC-1234"
              type="text"
              defaultValue=""
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={loading}>Añadir nuevo</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewPlateModal
