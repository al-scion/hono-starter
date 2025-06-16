import * as React from "react"
import { ChevronDown, LogOut, Moon, PanelLeft, Plus, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { SignOutButton } from "@clerk/clerk-react"
import { useUser } from "@clerk/clerk-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Kbd } from "../shortcuts/kbd"
import { Button } from "../ui/button"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {

  const [activeTeam] = React.useState(teams[0])
  const { setTheme, theme } = useTheme()
  const leftSidebar = useSidebar("left")
  const { user } = useUser()

  return (
    <SidebarMenu className="justify-center">
      <SidebarMenuItem className="flex flex-row items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 rounded-md px-2 hover:bg-sidebar-accent flex-1 min-w-0 justify-start">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md flex-shrink-0">
                <activeTeam.logo className="size-3" />
              </div>
              <span className="truncate font-medium min-w-0 flex-1">{user?.firstName}'s Workspace</span>
              <ChevronDown className="text-muted-foreground/80 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuItem className="gap-2 p-2 py-1.5">
              <Plus className="size-4" />
              <div>Add team</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 py-1.5" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              <div>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2 py-1.5" asChild>
              <SignOutButton>
                <div className="flex items-center gap-2">
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </div>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className="size-7 p-0 hover:bg-sidebar-accent ml-auto" 
              onClick={() => leftSidebar.toggleSidebar()}
            >
              <PanelLeft className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle sidebar
            <Kbd shortcutId="leftSidebarToggle" variant="secondary"/>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
