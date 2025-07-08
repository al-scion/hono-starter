import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from 'posthog-js/react';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!POSTHOG_KEY) {
    throw new Error('Missing Posthog Key');
  }
  const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
  if (!POSTHOG_HOST) {
    throw new Error('Missing Posthog Host');
  }

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
    <PostHogProvider
      apiKey={POSTHOG_KEY}
      options={{ api_host: POSTHOG_HOST, defaults: '2025-05-24' }}
    >
      <ClerkProvider
        afterSignOutUrl="/auth/sign-in"
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        signInForceRedirectUrl="/dashboard"
        signInUrl="/auth/sign-in"
        signUpForceRedirectUrl="/onboarding"
        signUpUrl="/auth/sign-up"
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              <TooltipProvider>
                <ReactFlowProvider>{children}</ReactFlowProvider>
                <Toaster closeButton position="top-right" richColors />
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </PostHogProvider>
  );
}
