import { useLocation, useRouter } from '@tanstack/react-router';
import { Box, Home, Search, Unplug } from 'lucide-react';
import { NavWorkspaces } from '@/components/sidebar/nav-workspaces';
import { TeamSwitcher } from '@/components/sidebar/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { useStore } from '@/lib/state';
import { useUser } from '@clerk/clerk-react';

export function AppSidebar() {
  const router = useRouter();
  const location = useLocation();
  const { user } = useUser();

  const data = {
    navHeader: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home,
        onClickHandler: () => router.navigate({ to: '/dashboard' }),
      },
      {
        title: 'Search',
        url: '#',
        icon: Search,
        onClickHandler: () => useStore.setState({ commandOpen: true }),
      },
      {
        title: 'Integrations',
        url: '#',
        icon: Unplug,
        onClickHandler: () => useStore.setState({ integrationsDialogOpen: true }),
      },
      {
        title: 'Templates',
        url: '#',
        icon: Box,
        onClickHandler: () => {},
      }
    ],
  };

  return (
    <SidebarProvider className='h-svh'>
      <Sidebar className="-mr-1 group w-full" collapsible="none">
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <SidebarGroup>
            <SidebarMenu>
              {data.navHeader.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.url}
                    onClick={item.onClickHandler}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <NavWorkspaces />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <img src={user?.imageUrl} alt={user?.fullName || ''} className='size-5 rounded-full' />
                <span>{user?.emailAddresses[0].emailAddress}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
