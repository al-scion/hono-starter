import { useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react';
import usePresence from '@convex-dev/presence/react';
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { IntegrationsDialog } from '@/components/chat/integrations-dialog';
import { CommandComponent } from '@/components/command/command-dialog';
import { CustomMcpDialog } from '@/components/dialog/custom-mcp';
import { DeployDialog } from '@/components/dialog/deploy';
import { McpHost } from '@/components/mcphost';
import { ShortcutMenu } from '@/components/shortcuts/shortcut-menu';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { SidebarProvider } from '@/components/ui/sidebar';
import { convexApi } from '@/lib/api';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Thread } from '@/components/chat/thread';

export const Route = createFileRoute('/_authenticated/_layout')({
  component: RouteComponent,
});

function PresenceRoom({ orgId, userId }: { orgId: string; userId: string }) {
  const presenceState = usePresence(convexApi.presence, orgId, userId);
  const { setPresenceState } = useStore();
  const { organization } = useOrganization();
  useEffect(() => {
    if (orgId === organization?.id) {
      setPresenceState(presenceState);
    }
  }, [presenceState, orgId, organization?.id, setPresenceState]);
  return null;
}

function RouteComponent() {
  const router = useRouter();
  const user = useUser();
  const org = useOrganization();
  const orgList = useOrganizationList({ userMemberships: { infinite: true } });
  const orgIds = orgList?.userMemberships.data?.map((org) => org.organization.id) ?? [];

  const {
    setLeftSidebarRef,
    setRightSidebarRef,
    setIsLeftSidebarCollapsed,
    setIsRightSidebarCollapsed,
    isRightSidebarCollapsed,
    isLeftSidebarCollapsed,
    toggleLeftSidebarCollapse,
    toggleRightSidebarCollapse,
  } = useStore();

  const leftSidebarRef = useCallback(
    (node: ImperativePanelHandle | null) => {
      setLeftSidebarRef(node ? { current: node } : null);
    },
    [setLeftSidebarRef]
  );
  const rightSidebarRef = useCallback(
    (node: ImperativePanelHandle | null) => {
      setRightSidebarRef(node ? { current: node } : null);
    },
    [setRightSidebarRef]
  );

  useHotkeys('bracketleft', toggleLeftSidebarCollapse);
  useHotkeys('bracketright', toggleRightSidebarCollapse);

  useEffect(() => {
    if (user.isLoaded && !user.user) {
      router.navigate({ to: '/auth/sign-in' });
    }
    if (user.user && user.user.organizationMemberships.length === 0) {
      router.navigate({ to: '/onboarding' });
    }
    if (org.isLoaded && !org.membership && orgList.userMemberships.data && orgList.userMemberships.data.length > 0) {
      orgList.setActive?.({ organization: orgList.userMemberships.data[0]?.organization.id})
    }
  }, [user, orgList, router]);

  return (
    <Authenticated>
      <SidebarProvider>
        <ResizablePanelGroup
          autoSaveId="sidebar-layout"
          className="bg-sidebar"
          direction="horizontal"
        >
          <ResizablePanel
            className="h-svh"
            collapsedSize={0}
            collapsible={true}
            defaultSize={15}
            maxSize={20}
            minSize={10}
            onCollapse={() => setIsLeftSidebarCollapsed(true)}
            onExpand={() => setIsLeftSidebarCollapsed(false)}
            ref={leftSidebarRef}
          >
            <AppSidebar />
          </ResizablePanel>
          <ResizableHandle
            className="bg-sidebar hover:bg-border hover:ring-[0.5px] hover:ring-border"
            onClick={toggleLeftSidebarCollapse}
          />
          <ResizablePanel
            className={cn(
              'm-2 rounded-lg border bg-background h-[calc(100svh-16px)]',
              !isLeftSidebarCollapsed && 'ml-0',
              !isRightSidebarCollapsed && 'mr-1'
            )}
          >
            <Outlet />
          </ResizablePanel>
          <ResizableHandle
            className="bg-sidebar hover:bg-border hover:ring-[0.5px] hover:ring-border"
            onClick={toggleRightSidebarCollapse}
          />
          <ResizablePanel
            className={cn(
              'rounded-lg bg-background h-[calc(100svh-16px)]',
              !isRightSidebarCollapsed && 'm-2 ml-1 border'
            )}
            collapsedSize={0}
            collapsible={true}
            defaultSize={20}
            maxSize={50}
            minSize={20}
            onCollapse={() => setIsRightSidebarCollapsed(true)}
            onExpand={() => setIsRightSidebarCollapsed(false)}
            ref={rightSidebarRef}
          >
            <Thread />
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
  );
}
