import {
  CreateOrganization,
  OrganizationProfile,
  UserProfile,
  useClerk,
  useOrganization,
  useOrganizationList,
} from '@clerk/clerk-react';
import {
  Briefcase,
  Check,
  ChevronDown,
  LogOut,
  Moon,
  PanelLeft,
  Plus,
  Sun,
  User,
  UserPlus,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Kbd } from '@/components/shortcuts/kbd';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useStore } from '@/lib/state';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function TeamSwitcher() {
  const { setTheme, theme } = useTheme();
  const { signOut } = useClerk();
  const { organization } = useOrganization({});
  const orgList = useOrganizationList({ userMemberships: { infinite: true } });
  const { toggleLeftSidebarCollapse } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [authDialogType, setAuthDialogType] = useState<
    'createOrg' | 'orgProfile' | 'userProfile'
  >('createOrg');

  function AuthDialogs() {
    return (
      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogTitle className="sr-only">Create Organization</DialogTitle>
        <DialogDescription className="sr-only">
          Create Organization
        </DialogDescription>
        <DialogContent className="w-fit min-w-fit max-w-fit rounded-xl border-none bg-transparent p-0">
          {authDialogType === 'createOrg' && <CreateOrganization />}
          {authDialogType === 'orgProfile' && <OrganizationProfile />}
          {authDialogType === 'userProfile' && <UserProfile />}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SidebarMenu className="justify-center">
      <AuthDialogs />
      <SidebarMenuItem className="flex flex-row items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-8 w-fit rounded-md px-2 font-normal hover:bg-sidebar-accent">
              <img
                alt={organization?.name}
                className="-ml-0.5 size-5 rounded-sm"
                src={organization?.imageUrl}
              />
              <span className="min-w-0 truncate">{organization?.name}</span>
              <div className="-ml-1 text-muted-foreground [&>svg]:size-3.5">
                <ChevronDown />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {orgList.userMemberships?.data?.map((org) => (
              <DropdownMenuItem
                key={org.organization.id}
                onClick={() =>
                  orgList.setActive?.({ organization: org.organization.id })
                }
              >
                <img
                  alt={org.organization.name}
                  className="-ml-0.5 size-5 rounded-md"
                  src={org.organization.imageUrl}
                />
                <span className="min-w-0 truncate">
                  {org.organization.name || org.organization.slug}
                </span>
                {org.organization.id === organization?.id && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => {
                setDialogOpen(true);
                setAuthDialogType('createOrg');
              }}
            >
              <Plus className="size-4" />
              <div>New workspace</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setDialogOpen(true);
                setAuthDialogType('orgProfile');
              }}
            >
              <UserPlus className="size-4" />
              <div>Invite members</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDialogOpen(true);
                setAuthDialogType('orgProfile');
              }}
            >
              <Briefcase className="size-4" />
              <div>Workspace settings</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDialogOpen(true);
                setAuthDialogType('userProfile');
              }}
            >
              <User className="size-4" />
              <div>Account settings</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
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
              className="ml-auto size-6 p-0 hover:bg-sidebar-accent hidden group-hover:flex"
              onClick={toggleLeftSidebarCollapse}
              variant="ghost"
            >
              <PanelLeft className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle sidebar
            <Kbd shortcutId="leftSidebarToggle" variant="secondary" />
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
