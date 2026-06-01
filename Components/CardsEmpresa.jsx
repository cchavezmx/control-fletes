import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CardsEmpresa ({ empresa }) {
  const { name } = empresa
  return (
    <Card className="bg-[#f5f5f5] w-[400px]">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">Grupo Intecsa</p>
        <h3 className="text-xl font-bold uppercase truncate">
          {name}
        </h3>
      </CardContent>
      <CardFooter>
        <Link href={`/${empresa._id}`} passHref legacyBehavior>
          <Button size="sm" asChild>
            <a>Detalles</a>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
