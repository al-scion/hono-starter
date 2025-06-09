import * as React from "react"
import { ChevronDown, LogOut, Moon, Plus, Sun } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {

  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const { state } = useSidebar()
  const { setTheme, theme } = useTheme()

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex flex-row items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-1.5">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md">
                <activeTeam.logo className="size-3" />
              </div>
              <span className="truncate font-medium">{activeTeam.name}</span>
              <ChevronDown className="opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuItem className="gap-2 p-2">
              <Plus className="size-4" />
              <div>Add team</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              <div>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2">
              <LogOut className="size-4" />
              <div>Sign out</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {state === 'expanded' && <SidebarTrigger className="ml-auto hover:bg-sidebar-accent"/>}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
