import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '../components/error-page';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorBoundary,
  notFoundComponent: () => <div>Not found here</div>,
});

function RootComponent() {
  return <Outlet />;
}
