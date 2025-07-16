import { useOrganization, useUser } from '@clerk/clerk-react';
import { useLocation, useRouter } from '@tanstack/react-router';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Ellipsis,
  Hash,
  Inbox,
  Loader,
  Plus,
  Settings,
  Trash2,
  UserPlus,
} from 'lucide-react';
import React, { useState } from 'react';
import { CreateChannelDialog } from '@/components/dialog/create-channel';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  useChannels,
  useCreateAgent,
  useDeleteAgent,
  useAgents,
  useDeleteChannel,
} from '@/hooks/use-convex';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function NavWorkspaces() {
  const router = useRouter();
  const location = useLocation();
  const org = useOrganization({ memberships: { infinite: true } });
  const { user } = useUser();

  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [directMessagesOpen, setDirectMessagesOpen] = useState(true);

  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  const toggleWorkspace = (name: string) => {
    setOpenStates((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const { data: channels } = useChannels();
  const { data: agents } = useAgents();
  const { mutate: createAgent, isPending: isCreatingAgent } = useCreateAgent();
  const { mutate: deleteAgent } = useDeleteAgent();
  const { mutate: deleteChannel } = useDeleteChannel(); 

  const { setCreateChannelDialogOpen, presenceState } = useStore();

  return (
    <>
      <CreateChannelDialog />
      <SidebarGroup>
        <SidebarGroupLabel
          className="group/sidebar-label relative mb-[1px] cursor-pointer select-none gap-0.5 px-2 pr-1 hover:bg-sidebar-accent"
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
        >
          <span className="text-xs">Agents</span>
          <ChevronDown
            className={cn(
              'size-3 transition-transform duration-200',
              !workspaceOpen && '-rotate-90'
            )}
          />
          <Button
            className="ml-auto size-6 items-center justify-center p-1 opacity-0 group-hover/sidebar-label:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              createAgent({});
              setWorkspaceOpen(true);
            }}
            disabled={isCreatingAgent}
            variant="ghost"
          >
            <Plus className="size-4" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent
          className={cn(
            'grid overflow-hidden transition-all duration-200 ease-in-out',
            workspaceOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <SidebarMenu className="min-h-0 gap-[1px]">
            {agents?.map((agent) => {
              const isOpen = openStates[agent._id];
              return (
                <React.Fragment key={agent._id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="group/workspace-item relative transition-none"
                      isActive={location.pathname.includes(agent._id)}
                      onClick={() =>
                        router.navigate({
                          to: '/agent/$agentId',
                          params: { agentId: agent._id },
                          search: { mode: 'editor' },
                        })
                      }
                    >
                      {agent.emoji ? <p className="w-4 text-base leading-none">{agent.emoji}</p> : <Loader className="size-4" />}
                      <span className="truncate">{agent.name || 'New agent'}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className={cn(
                              "absolute right-1 top-1/2 -translate-y-1/2",
                              "opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100",
                              "bg-sidebar-accent hover:bg-sidebar-accent",
                              "group-data-[active=false]/workspace-item:bg-sidebar",
                              "group-data-[active=false]/workspace-item:group-hover/workspace-item:bg-sidebar-accent",
                              "transition-none mask-l-from-6 h-6 w-12 p-1 pl-7"
                            )}
                            variant="ghost"
                          >
                            <Ellipsis className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAgent({ agentId: agent._id });
                            }}
                          >
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAgent({ agentId: agent._id });
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        className="absolute left-1 z-50 hidden size-6 p-0 bg-sidebar-accent group-hover/workspace-item:flex [&>svg]:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkspace(agent._id);
                        }}
                        variant="ghost"
                      >
                        <ChevronRight className={`size-3.5 transition-transform duration-200 ${isOpen && 'rotate-90'}`} />
                      </Button>
                    </SidebarMenuButton>
                    {isOpen && (
                      <div className="mt-[1px] ml-4 border-l pl-1">
                        <SidebarMenuButton>
                          <Inbox className="size-4" />
                          Conversations
                        </SidebarMenuButton>
                      </div>
                    )}
                  </SidebarMenuItem>
                </React.Fragment>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* -------------------- Channels Group -------------------- */}

      <SidebarGroup>
        <SidebarGroupLabel
          className="group/sidebar-label relative mb-[1px] cursor-pointer select-none gap-0.5 px-2 pr-1 hover:bg-sidebar-accent"
          onClick={() => setChannelsOpen(!channelsOpen)}
        >
          <span className="text-xs">Channels</span>
          <ChevronDown
            className={cn(
              'size-3 transition-transform duration-200',
              !channelsOpen && '-rotate-90'
            )}
          />
          <Button
            className="ml-auto size-6 items-center justify-center p-1 opacity-0 group-hover/sidebar-label:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setCreateChannelDialogOpen(true);
            }}
            variant="ghost"
          >
            <Plus className="size-4" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent
          className={cn(
            'grid overflow-hidden transition-all duration-200 ease-in-out',
            channelsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <SidebarMenu className="min-h-0 gap-[1px]">
            {channels?.map((channel) => (
              <SidebarMenuItem key={channel._id}>
                <SidebarMenuButton
                  className="group/workspace-item relative pr-1"
                  isActive={location.pathname.includes(channel._id)}
                  onClick={() =>
                    router.navigate({
                      to: '/channel/$channelId',
                      params: { channelId: channel._id },
                      search: { thread: undefined }
                    })
                  }
                >
                  <Hash className="size-4" />
                  <span className="truncate">{channel.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={cn(
                          "absolute right-1 top-1/2 -translate-y-1/2 bg-sidebar-accent",
                          "opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100"
                        )}
                        variant="ghost"
                        size="icon"
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right">
                      <DropdownMenuItem>
                        <UserPlus className="size-4" />
                        Invite
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="size-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChannel({ channelId: channel._id });
                          if (location.pathname.includes(channel._id)) router.navigate({ to: '/dashboard' });
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* -------------------- Direct Messages Group -------------------- */}

      <SidebarGroup>
        <SidebarGroupLabel
          className="group/sidebar-label relative mb-[1px] cursor-pointer select-none gap-0.5 px-2 pr-1 hover:bg-sidebar-accent"
          onClick={() => setDirectMessagesOpen(!directMessagesOpen)}
        >
          <span className="text-xs">Direct messages</span>
          <ChevronDown
            className={cn(
              'size-3 transition-transform duration-200',
              !directMessagesOpen && '-rotate-90'
            )}
          />
          <Button
            className="ml-auto size-6 items-center justify-center p-1 opacity-0 group-hover/sidebar-label:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              // setCreateChannelDialogOpen(true)
            }}
            variant="ghost"
          >
            <Plus className="size-4" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent
          className={cn(
            'grid overflow-hidden transition-all duration-200 ease-in-out',
            directMessagesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <SidebarMenu className="min-h-0 gap-[1px]">
            {org.memberships?.data?.map((member) => (
              <SidebarMenuItem key={member.id}>
                <SidebarMenuButton
                  className="group/workspace-item relative pr-1"
                  // isActive={channelParams?.channelId === channel._id}
                  onClick={() => router.navigate({ to: '/direct-message'})}
                >
                  <div className=" relative shrink-0">
                    <img
                      alt={member.publicUserData?.firstName || ''}
                      className="size-5 rounded-sm"
                      src={member.publicUserData?.imageUrl}
                    />
                    {presenceState?.find(
                      (presence) =>
                        presence.userId === member.publicUserData?.userId
                    ) && (
                      <span className="-end-1 -bottom-1 absolute size-3 rounded-full border-2 border-sidebar bg-green-600" />
                    )}
                  </div>
                  <span className="truncate">
                    {member.publicUserData?.firstName}{' '}
                    {member.publicUserData?.lastName}
                  </span>
                  {user?.id === member.publicUserData?.userId && (
                    <span className="text-muted-foreground text-sm">you</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={cn(
                          "absolute right-1 top-1/2 -translate-y-1/2 bg-sidebar-accent",
                          "opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100"
                        )}
                        variant="ghost"
                        size="icon"
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right">
                      <DropdownMenuItem>
                        <UserPlus className="size-4" />
                        Invite
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="size-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
