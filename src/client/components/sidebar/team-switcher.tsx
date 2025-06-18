import { Building2, ChevronDown, LogOut, Moon, PanelLeft, Plus, Sun } from "lucide-react"
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
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { SignOutButton } from "@clerk/clerk-react"
import { useUser } from "@clerk/clerk-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Kbd } from "../shortcuts/kbd"
import { Button } from "../ui/button"
import { useOrganization } from "@clerk/clerk-react"

export function TeamSwitcher() {

  const { setTheme, theme } = useTheme()
  const leftSidebar = useSidebar("left")
  const { user } = useUser()
  const { organization } = useOrganization()

  return (
    <SidebarMenu className="justify-center">
      <SidebarMenuItem className="flex flex-row items-center gap-1">
        <SidebarMenuButton className="pr-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex flex-row items-center gap-2">
              {organization?.imageUrl ? <img src={organization?.imageUrl} alt={organization?.name} className="size-4 rounded-full" /> : <Building2 className="size-4" />}
              <span className="truncate">{user?.firstName}'s Workspace</span>
              <ChevronDown className="text-muted-foreground/80 size-4" />
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
                className="size-6 p-0 ml-auto hover:bg-zinc-300" 
                onClick={(e) => {
                  e.stopPropagation()
                  leftSidebar.toggleSidebar()
                }}
              >
                <PanelLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle sidebar
              <Kbd shortcutId="leftSidebarToggle" variant="secondary"/>
            </TooltipContent>
          </Tooltip>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
