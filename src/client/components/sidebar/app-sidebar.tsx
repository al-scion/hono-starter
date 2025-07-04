import * as React from "react"
import {
  Blocks,
  Box,
  Home,
  Search,
  Settings,
} from "lucide-react"
import { NavWorkspaces } from "@/components/sidebar/nav-workspaces"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { useStore } from "@/lib/state"
import { useLocation, useRouter } from "@tanstack/react-router"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
      onClickHandler: () => useStore.setState({ commandOpen: true }),
    },
    {
      title: "Home",
      url: "/app/dashboard",
      icon: Home,
    },
    {
      title: "Integrations",
      url: "#",
      icon: Box,
      onClickHandler: () => useStore.setState({ integrationsDialogOpen: true })
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const location = useLocation()
  
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-12 border-b py-1.5 justify-center">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  isActive={location.pathname === item.url}
                  onClick={() => {
                    if (item.onClickHandler) {
                      item.onClickHandler();
                    } else {
                      router.navigate({ to: item.url });
                    }
                  }}
                  className='data-[active=true]:bg-background data-[active=true]:border-border'
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
          {data.navSecondary.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                isActive={location.pathname === item.url} 
                onClick={() => {router.navigate({to: item.url})}}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
