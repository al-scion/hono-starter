import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CommandComponent } from '@/components/command/command-dialog';
import { ShortcutMenu } from '@/components/shortcuts/shortcut-menu';
import { IntegrationsDialog } from '@/components/chat/integrations-dialog';
import { Header } from '@/components/header/header'
import { DeployDialog } from '@/components/dialog/deploy'
import { CustomMcpDialog } from '@/components/dialog/custom-mcp'
import { McpHost } from '@/components/mcphost'
import { Chat } from '@/components/sidebar/chat'
import { Authenticated } from "convex/react";
import { useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react';
import usePresence from "@convex-dev/presence/react";
import { convexApi } from '@/lib/api';
import { useEffect } from 'react';
import { useStore } from '@/lib/state';

export const Route = createFileRoute('/_authenticated/_layout')({
  component: RouteComponent,
})

function PresenceRoom({orgId, userId}: {orgId: string, userId: string}) {
  const presenceState = usePresence(convexApi.presence, orgId, userId);
  const { setPresenceState } = useStore();
  const { organization } = useOrganization();

  useEffect(() => {
    if (orgId === organization?.id) {
      setPresenceState(presenceState)
    }
  }, [presenceState])

  return null;
}

function RouteComponent() {
  const router = useRouter();
  const user = useUser();
  const org = useOrganization();
  const orgList = useOrganizationList({userMemberships: {infinite: true}});
  const orgIds = orgList?.userMemberships.data?.map((org) => org.organization.id) ?? []


  useEffect(() => {
    if (user.isLoaded && !user.user) {
      router.navigate({ to: "/auth/sign-in" })
    }
    if (org.isLoaded && !org.organization) {
      router.navigate({ to: "/onboarding" })
    }
  }, [user, org])

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
      {orgIds.map((orgId) => (
        <PresenceRoom key={orgId} orgId={orgId} userId={user.user?.id ?? ''} />
      ))}
    </Authenticated>
  )
}
