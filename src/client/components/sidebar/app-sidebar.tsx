import * as React from "react"
import {
  Blocks,
  Search,
  Settings,
  Unplug,
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

const data = {
  navHeader: [
    {
      title: "Search",
      url: "#",
      icon: Search,
      onClickHandler: () => useStore.setState({ commandOpen: true }),
    },
    {
      title: "Integrations",
      url: "#",
      icon: Unplug,
      onClickHandler: () => useStore.setState({ integrationsDialogOpen: true })
    },
  ],
  navFooter: [
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
      <SidebarHeader className="py-1">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarMenu>
            {data.navHeader.map((item) => (
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
      {/* <SidebarFooter className="py-1">
        <SidebarMenu>
          {data.navFooter.map((item) => (
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
      </SidebarFooter> */}
      <SidebarRail className="-mr-0.25" />
    </Sidebar>
  )
}
