import { Building2, ChevronDown, LogOut, Moon, Plus, Sun } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"

export function TeamSwitcher() {

  const { setTheme, theme } = useTheme()
  const session = authClient.useSession()
  const userName = session?.data?.user?.name
  const userImage = session?.data?.user?.image

  return (
    <SidebarMenu className="justify-center">
      <SidebarMenuItem className="flex flex-row items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-8 px-2 w-fit rounded-md hover:bg-sidebar-accent font-normal">
              {userImage ? <img src={userImage} alt={userName} className="size-4 rounded-full" /> : <Building2 className="size-4" />}
              <span className="truncate min-w-0">{userName}'s Workspace</span>
              <div className="text-muted-foreground [&>svg]:size-3.5 -ml-1"><ChevronDown  /></div>
            </SidebarMenuButton>
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
            <DropdownMenuItem className="gap-2 p-2 py-1.5" onClick={() => authClient.signOut()}>
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
