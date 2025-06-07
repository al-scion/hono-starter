import { SignUp } from "@clerk/clerk-react";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_layout/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
