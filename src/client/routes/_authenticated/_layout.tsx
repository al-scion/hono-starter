import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { SignedIn, useAuth } from '@clerk/clerk-react'
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CommandComponent } from '@/components/command/command-dialog';
import { ShortcutMenu } from '@/components/shortcuts/shortcut-menu';
import { IntegrationsDialog } from '@/components/chat/integrations-dialog';
import { Header } from '@/components/header'
import { DeployDialog } from '@/components/dialog/deploy'
import { CustomMcpDialog } from '@/components/dialog/custom-mcp'
import { McpHost } from '@/components/mcphost'
import { Chat } from '@/components/sidebar/chat'

export const Route = createFileRoute('/_authenticated/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  if (isLoaded && !userId) router.navigate({ to: '/auth/sign-in' });

  return (
    <SignedIn>
      <SidebarProvider>
        <AppSidebar variant='inset' />
        <SidebarInset className='flex-row'>
          <main className='flex flex-col flex-1 border bg-background rounded-lg relative h-[calc(100dvh-16px)]'>
            <Header className='sticky top-0 z-50' />
            <div className='overflow-y-auto flex-1'>
              <Outlet />
            </div>
          </main>
          <Chat />
        </SidebarInset>
      </SidebarProvider>
      <CommandComponent />
      <ShortcutMenu />
      <IntegrationsDialog />
      <DeployDialog />
      <CustomMcpDialog />
      <McpHost />
    </SignedIn>
  )
}
