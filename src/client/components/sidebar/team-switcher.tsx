import { Briefcase, Check, ChevronDown, LogOut, Moon, PanelLeft, Plus, Sun, User } from "lucide-react"
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
import { useClerk, useOrganization, useOrganizationList } from "@clerk/clerk-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { CreateOrganization, OrganizationProfile, UserProfile } from "@clerk/clerk-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Kbd } from "@/components/shortcuts/kbd"
import { useStore } from "@/lib/state"


export function TeamSwitcher() {

  const { setTheme, theme } = useTheme()
  const { signOut } = useClerk()
  const { organization } = useOrganization({})
  const orgList = useOrganizationList({userMemberships: {infinite: true}})
  const { toggleLeftSidebarCollapse } = useStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [authDialogType, setAuthDialogType] = useState<'createOrg' | 'orgProfile' | 'userProfile'>('createOrg')

  function AuthDialogs() {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle className="sr-only">Create Organization</DialogTitle>
        <DialogDescription className="sr-only">Create Organization</DialogDescription>
        <DialogContent className="p-0 w-fit max-w-fit min-w-fit border-none bg-transparent rounded-xl">
          {authDialogType === 'createOrg' && <CreateOrganization />}
          {authDialogType === 'orgProfile' && <OrganizationProfile />}
          {authDialogType === 'userProfile' && <UserProfile />}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <SidebarMenu className="justify-center">
      <AuthDialogs />
      <SidebarMenuItem className="flex flex-row items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-8 px-2 w-fit rounded-md hover:bg-sidebar-accent font-normal">
              <img src={organization?.imageUrl} alt={organization?.name} className="size-5 rounded-full -ml-0.5" />
              <span className="truncate min-w-0">{organization?.name}</span>
              <div className="text-muted-foreground [&>svg]:size-3.5 -ml-1"><ChevronDown /></div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {orgList.userMemberships?.data?.map((org) => (
              <DropdownMenuItem key={org.organization.id} onClick={() => orgList.setActive?.({ organization: org.organization.id })}>
                <img src={org.organization.imageUrl} alt={org.organization.name} className="size-5 rounded-full -ml-0.5" />
                <span className="truncate min-w-0">{org.organization.name || org.organization.slug}</span>
                {org.organization.id === organization?.id && <Check className="size-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={() => {
                setDialogOpen(true)
                setAuthDialogType('createOrg')
              }}
            >
              <Plus className="size-4" />
              <div>New workspace</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setDialogOpen(true)
              setAuthDialogType('orgProfile')
            }}>
              <Briefcase className="size-4" />
              <div>Workspace settings</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setDialogOpen(true)
              setAuthDialogType('userProfile')
            }}>
              <User className="size-4" />
              <div>Account settings</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              <div>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className='size-6 p-0 ml-auto hover:bg-sidebar-accent opacity-0 group-hover:opacity-100'
              onClick={toggleLeftSidebarCollapse}
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
