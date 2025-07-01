import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CommandComponent } from '@/components/command/command-dialog';
import { ShortcutMenu } from '@/components/shortcuts/shortcut-menu';
import { IntegrationsDialog } from '@/components/chat/integrations-dialog';
import { Header } from '@/components/header/header'
import { DeployDialog } from '@/components/dialog/deploy'
import { CustomMcpDialog } from '@/components/dialog/custom-mcp'
import { McpHost } from '@/components/mcphost'
import { Authenticated } from "convex/react";
import { useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react';
import usePresence from "@convex-dev/presence/react";
import { convexApi } from '@/lib/api';
import { useEffect, useCallback } from 'react';
import { useStore } from '@/lib/state';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ImperativePanelHandle } from 'react-resizable-panels'
import { Messages } from '@/components/chat/messages'
import { cn } from '@/lib/utils'
import { useHotkeys } from 'react-hotkeys-hook'

export const Route = createFileRoute('/_authenticated/_layout')({
  component: RouteComponent,
})

function PresenceRoom({orgId, userId}: {orgId: string, userId: string}) {
  const presenceState = usePresence(convexApi.presence, orgId, userId);
  const { setPresenceState } = useStore();
  const { organization } = useOrganization();
  useEffect(() => {
    if (orgId === organization?.id) setPresenceState(presenceState)
  }, [presenceState])
  return null;
}

function RouteComponent() {
  const router = useRouter();
  const user = useUser();
  const org = useOrganization();
  const orgList = useOrganizationList({userMemberships: {infinite: true}});
  const orgIds = orgList?.userMemberships.data?.map((org) => org.organization.id) ?? []

  const { 
    setLeftSidebarRef, setRightSidebarRef, 
    chatId, 
    setIsLeftSidebarCollapsed, 
    setIsRightSidebarCollapsed,
    isRightSidebarCollapsed,
    isLeftSidebarCollapsed,
    toggleLeftSidebarCollapse,
    toggleRightSidebarCollapse,
  } = useStore();
  
  const leftSidebarRef = useCallback((node: ImperativePanelHandle | null) => {
    setLeftSidebarRef(node ? { current: node } : null);
  }, [setLeftSidebarRef]);
  const rightSidebarRef = useCallback((node: ImperativePanelHandle | null) => {
    setRightSidebarRef(node ? { current: node } : null);
  }, [setRightSidebarRef]);

  useHotkeys('bracketleft', toggleLeftSidebarCollapse)
  useHotkeys('bracketright', toggleRightSidebarCollapse)

  useEffect(() => {
    if (!user.isLoaded || !org.isLoaded || !orgList.isLoaded) return
    if (!user.user) {
      router.navigate({ to: "/auth/sign-in" })
      return
    }
    if (user.user.organizationMemberships.length === 0) {
      router.navigate({to: '/onboarding'})
      return
    }
    if (!org.organization && orgList.userMemberships.data && orgList.userMemberships.data.length > 0){
      const firstOrg = orgList.userMemberships.data[0].organization;
      orgList.setActive({organization: firstOrg.id})
      return
    }
  }, [user, org, orgList])

  return (
    <Authenticated>
      <SidebarProvider>
        <ResizablePanelGroup autoSaveId='sidebar-layout' direction="horizontal">
          <ResizablePanel
            className='h-svh'
            defaultSize={15}
            maxSize={20} 
            minSize={10}
            collapsedSize={0}
            collapsible={true}
            onCollapse={() => setIsLeftSidebarCollapsed(true)}
            onExpand={() => setIsLeftSidebarCollapsed(false)}
            ref={leftSidebarRef}
          >
            <AppSidebar />
          </ResizablePanel>
          <ResizableHandle className='bg-sidebar hover:bg-border hover:ring-[0.5px] hover:ring-border' onClick={toggleLeftSidebarCollapse} />
          <ResizablePanel 
            className={cn(
              'py-1 pr-0.5 bg-sidebar',
              isLeftSidebarCollapsed ? 'pl-1' : 'pl-0'
            )}
          >
            <div className='rounded-lg border bg-background h-full flex flex-col'>
              <Header className='sticky top-0' />
              <div className='overflow-y-auto flex flex-col flex-1'>
                <Outlet />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle className='bg-sidebar hover:bg-border hover:ring-[0.5px] hover:ring-border' onClick={toggleRightSidebarCollapse} />
          <ResizablePanel
            className={cn(
              !isRightSidebarCollapsed && 'p-1 bg-sidebar',
              "pl-0.5",
            )}
            defaultSize={20}
            maxSize={25} 
            minSize={15}
            collapsedSize={0}
            collapsible={true}
            onCollapse={() => setIsRightSidebarCollapsed(true)}
            onExpand={() => setIsRightSidebarCollapsed(false)}
            ref={rightSidebarRef}
          >
            <Messages 
              key={chatId} 
              className={cn(
                'flex flex-1 flex-col h-full overflow-hidden bg-background rounded-lg border',
                isRightSidebarCollapsed && 'border-none'
              )}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
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
