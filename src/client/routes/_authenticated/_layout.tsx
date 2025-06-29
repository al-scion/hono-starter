import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
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
import { Authenticated } from "convex/react";
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_authenticated/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = authClient.useSession();
  const router = useRouter();
  if (!auth.isPending && !auth.data?.session) {
    router.navigate({ to: "/auth/sign-in" })
  }

  return (
    <Authenticated>
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
    </Authenticated>
  )
}
