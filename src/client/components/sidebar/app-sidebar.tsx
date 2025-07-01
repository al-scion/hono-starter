import {
  Home,
  Search,
  Unplug,
} from "lucide-react"
import { NavWorkspaces } from "@/components/sidebar/nav-workspaces"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { useStore } from "@/lib/state"
import { useLocation, useRouter } from "@tanstack/react-router"

export function AppSidebar() {
  const router = useRouter()
  const location = useLocation()

  const data = {
    navHeader: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        onClickHandler: () => router.navigate({ to: "/dashboard" })
      },
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
  }
  
  return (
    <Sidebar collapsible="none" className="w-full -mr-1 group">
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
    </Sidebar>
  )
}
