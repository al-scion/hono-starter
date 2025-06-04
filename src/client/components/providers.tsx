import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">
      <QueryClientProvider client={queryClient}>
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