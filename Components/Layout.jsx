import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import Appbar from './Appbar'

const ResponsiveAppBar = ({ children }) => {
  const { user, error: errorUser, isLoading } = useUser()
  const router = useRouter()

  // Lock the viewport only on the expediente detail page so the table owns the scroll.
  // Other pages (dashboard, wizard, etc.) keep normal page-level scroll.
  const isLocked =
    typeof router?.asPath === 'string' &&
    /^\/[a-f0-9]{24}\/?$/.test(router.asPath)

  if (isLoading) return <div>Loading...</div>
  if (errorUser) return <div>{errorUser.message}</div>
  if (user) {
    return (
      <div className={`app-shell${isLocked ? ' is-locked' : ''}`}>
        <Appbar />
        <div className="layout-shell">
          {children}
        </div>
      </div>
    )
  }

  return <></>
}

export default withPageAuthRequired(ResponsiveAppBar)
