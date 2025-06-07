import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { useAuth, SignedOut } from '@clerk/clerk-react'

export const Route = createFileRoute('/auth/_layout')({
  component: AuthLayout,
})

function AuthLayout() {
  const router = useRouter();
  const { userId } = useAuth();
  if (userId) router.navigate({ to: '/app/dashboard' });

  return (
    <SignedOut>
      <Outlet />
    </SignedOut>
  )
}