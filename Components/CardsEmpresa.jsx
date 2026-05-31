import * as React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function CardsEmpresa ({ empresa }) {
  const { name } = empresa
  
  return (
    <Card className="bg-muted w-full max-w-md">
      <CardHeader className="pb-2">
        <Badge variant="secondary" className="w-fit mb-2">Grupo Intecsa</Badge>
        <CardTitle className="text-lg uppercase truncate" title={name}>
          {name}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Espacio para más contenido si lo necesitas */}
      </CardContent>
      
      <CardFooter>
        <Link href={`/${empresa._id}`} passHref legacyBehavior>
          <Button size="sm">Detalles</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
