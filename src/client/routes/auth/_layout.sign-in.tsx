import { SignIn } from "@clerk/clerk-react";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_layout/sign-in')({
  component: SignInPage,
})


function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
