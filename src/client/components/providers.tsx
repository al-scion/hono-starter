import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { type ReactNode } from "react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from 'posthog-js/react'
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactFlowProvider } from '@xyflow/react'

export function Providers({ children }: { children: ReactNode }) {
  
  const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!POSTHOG_KEY) throw new Error("Missing Posthog Key")
  const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
  if (!POSTHOG_HOST) throw new Error("Missing Posthog Host")
  
  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);
  
  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={{api_host: POSTHOG_HOST, defaults: '2025-05-24'}}>
      <ClerkProvider 
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} 
        signInUrl="/auth/sign-in" 
        signUpUrl="/auth/sign-up" 
        afterSignOutUrl="/auth/sign-in"
        signUpForceRedirectUrl="/onboarding"
        signInForceRedirectUrl="/dashboard"
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <ReactFlowProvider>
                  {children}
                </ReactFlowProvider>
                <Toaster richColors closeButton position="top-right" />
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </PostHogProvider>
  );
} 