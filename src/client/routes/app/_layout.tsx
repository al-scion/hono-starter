import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { SignedIn, useAuth } from '@clerk/clerk-react'

export const Route = createFileRoute('/app/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
  const { userId } = useAuth();
  if (!userId) router.navigate({ to: '/auth/sign-in' });

  return (
    <SignedIn>
      <Outlet />
    </SignedIn>
  )
}
