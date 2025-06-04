import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '../components/error-page'

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorBoundary,
})

function RootComponent() {
  return <Outlet />
} 