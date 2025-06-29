import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Google } from '@/lib/icons'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
// import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_unauthenticated/auth/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const auth = authClient.useSession();
  const router = useRouter();
  if (!auth.isPending && auth.data?.session) {
    router.navigate({ to: "/dashboard" })
  }


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" 
                  onClick={() => {
                    authClient.signIn.social({
                      provider: "google",
                    })
                  }}
                  >
                  <Google />
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  // Avoid race condition with uncontrolled form submission
                  try {
                    await authClient.signIn.email({
                      email,
                      password,
                    });
                  } catch (error) {
                    // TODO: surface error to the user via toast once UI library available
                    console.error("Failed to sign in", error);
                  }
                }}
              >
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>
              </form>
              <div className="flex flex-row justify-center items-center gap-2 text-sm">
                <span>Don't have an account?</span>
                <Link to="/auth/sign-up" className="hover:underline" >Sign up</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
