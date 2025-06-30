import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useUser, SignUp, useSignUp } from '@clerk/clerk-react';


export const Route = createFileRoute('/_unauthenticated/auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const { user } = useUser();
  const router = useRouter();
  if (user) router.navigate({ to: "/dashboard" })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
