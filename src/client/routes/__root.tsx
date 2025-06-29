import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '../components/error-page'
import { authClient } from '@/lib/auth-client'

interface RouterContext {
  auth: ReturnType<typeof authClient.useSession>
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ErrorBoundary,
})

function RootComponent() {
  return <Outlet />
} 