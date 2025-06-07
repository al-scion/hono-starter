import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { posthog } from "@/lib/posthog";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing Publishable Key")

function PostHogTracker() {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Identify user when they sign in
    if (isSignedIn && userId && user) {
      posthog.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        username: user.username,
        created_at: user.createdAt,
      })
    }

    // Reset PostHog when user signs out
    if (!isSignedIn) {
      posthog.reset()
    }
  }, [isSignedIn, userId, user])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up" afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <PostHogTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
} 