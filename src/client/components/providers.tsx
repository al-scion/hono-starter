import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { type ReactNode } from "react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from 'posthog-js/react'
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { ReactFlowProvider } from '@xyflow/react'

export function Providers({ children }: { children: ReactNode }) {
  
  const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!POSTHOG_KEY) throw new Error("Missing Posthog Key")
  const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
  if (!POSTHOG_HOST) throw new Error("Missing Posthog Host")
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
  if (!CONVEX_URL) throw new Error("Missing Convex URL")
    
    
  const convex = new ConvexReactClient(CONVEX_URL);
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
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
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
      </ConvexBetterAuthProvider>
    </PostHogProvider>
  );
} 