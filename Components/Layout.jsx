import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0'
import Appbar from './Appbar'

const ResponsiveAppBar = ({ children }) => {
  const { user, error: errorUser, isLoading } = useUser()

  if (isLoading) return <div className="p-8">Loading...</div>
  if (errorUser) return <div className="p-8 text-destructive">{errorUser.message}</div>
  if (!user) return null

  return (
    <>
      <Appbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </>
  )
}

export default withPageAuthRequired(ResponsiveAppBar)
