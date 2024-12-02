import { withAuth } from "@auth0/nextjs-auth0/edge"

export default withAuth({
  // Configura el middleware para que se aplique solo en rutas protegidas
  publicRoutes: ["/paqueterita"], // Rutas que no requieren autenticación
})
