import { SignIn, useUser } from '@clerk/clerk-react';
import { createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/_unauthenticated/auth/sign-in')({
  component: SignInPage,
});

function SignInPage() {
  const { user } = useUser();
  const router = useRouter();
  if (user) {
    router.navigate({ to: '/dashboard' });
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
