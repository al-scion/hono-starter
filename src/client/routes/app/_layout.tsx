import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { SignedIn, useAuth } from '@clerk/clerk-react'
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { RightSidebar } from '@/components/sidebar/right-sidebar';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CommandComponent } from '@/components/command/command-dialog';
import { ShortcutMenu } from '@/components/shortcuts/shortcut-menu';
import { IntegrationsDialog } from '@/components/chat/integrations-dialog';
import { Header } from '@/components/header'
import { DeployDialog } from '@/components/dialog/deploy'

export const Route = createFileRoute('/app/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  if (isLoaded && !userId) router.navigate({ to: '/auth/sign-in' });

  return (
    <SignedIn>
      <SidebarProvider>
        <AppSidebar  />
        <SidebarInset >
          <Header />
          <Outlet />
        </SidebarInset>
        <RightSidebar />
      </SidebarProvider>
      <CommandComponent />
      <ShortcutMenu />
      <IntegrationsDialog />
      <DeployDialog />
    </SignedIn>
  )
}
