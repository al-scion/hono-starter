import { ChevronRight, Ellipsis, Plus, Trash2, ChevronDown, Hash, Lock, Settings, UserPlus } from "lucide-react"
import React, { useState } from "react"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { Id } from "@/lib/api";
import { useParams, useRouter } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/state";
import { CreateChannelDialog } from "@/components/dialog/create-channel";
import { useChannels, useCreateDocument, useDeleteDocument, useDocuments } from "@/hooks/use-convex";
import { useOrganization, useUser } from "@clerk/clerk-react";

export function NavWorkspaces() {
  
  const router = useRouter()
  const org = useOrganization({memberships: {infinite: true}})
  const { user } = useUser()
  const params = useParams({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false })
  const docId = params?.docId ?? '' as Id<'documents'>

  const [workspaceOpen, setWorkspaceOpen] = useState(true)
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [directMessagesOpen, setDirectMessagesOpen] = useState(true)
  
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const toggleWorkspace = (name: string) => {
    setOpenStates((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const { data: channels } = useChannels()
  const { data: documents } = useDocuments()
  const { mutate: createDocument, isPending: isCreatingDocument } = useCreateDocument()
  const { mutate: deleteDocument } = useDeleteDocument()

  const { setCreateChannelDialogOpen, presenceState } = useStore()

  // Params for active channel detection
  const channelParams = useParams({ from: '/_authenticated/_layout/channel/$channelId', shouldThrow: false }) as { channelId?: Id<'channels'> }

  return (
    <>
      <CreateChannelDialog />
      <SidebarGroup>
        <SidebarGroupLabel 
          className="px-2 pr-1 relative gap-0.5 group/sidebar-label hover:bg-sidebar-accent cursor-pointer mb-[1px] select-none"
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
        >
          <span className="text-xs">Agents</span>
          <ChevronDown className={cn("size-3 transition-transform duration-200", !workspaceOpen && "-rotate-90")} />
          <Button
            variant="ghost"
            className="size-6 p-1 items-center justify-center ml-auto opacity-0 group-hover/sidebar-label:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              if (isCreatingDocument) return
              createDocument({})
            }}
          >
            <Plus className="size-4"/>
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent className={cn("transition-all duration-200 ease-in-out", !workspaceOpen && "hidden")}>
          <SidebarMenu className="gap-[1px]">
            {documents?.map((document) => {
              const isOpen = openStates[document._id]
              return (
                <React.Fragment key={document._id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      className="group/workspace-item pr-1 relative"
                      isActive={docId === document._id}
                      onClick={() => router.navigate({ to: '/document/$docId', params: { docId: document._id }, search: { mode: 'editor' } })}
                    >
                      <span className="w-4 text-base leading-none">{document.emoji}</span>
                      <span className="truncate">{document.title || 'New document'}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="size-6 p-1 ml-auto opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100"
                          >
                            <Ellipsis className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            deleteDocument({ docId: document._id })
                          }}>
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        asChild
                        variant="ghost"
                        className="absolute left-1 z-50 size-6 p-1 hidden group-hover/workspace-item:block bg-sidebar-accent hover:bg-zinc-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWorkspace(document._id)
                        }}
                      >
                        <span>
                          <ChevronRight className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}/>
                        </span>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </React.Fragment>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* -------------------- Channels Group -------------------- */}

      <SidebarGroup>
        <SidebarGroupLabel
          className="px-2 pr-1 relative gap-0.5 group/sidebar-label hover:bg-sidebar-accent cursor-pointer mb-[1px] select-none"
          onClick={() => setChannelsOpen(!channelsOpen)}
        >
          <span className="text-xs">Channels</span>
          <ChevronDown className={cn("size-3 transition-transform duration-200", !channelsOpen && "-rotate-90")} />
          <Button
            variant="ghost"
            className="size-6 p-1 items-center justify-center ml-auto opacity-0 group-hover/sidebar-label:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              setCreateChannelDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent className={cn("transition-all duration-200 ease-in-out", !channelsOpen && "hidden")}>
          <SidebarMenu className="gap-[1px]">
            {channels?.map((channel) => (
              <SidebarMenuItem key={channel._id}>
                <SidebarMenuButton
                  className="group/workspace-item pr-1 relative"
                  isActive={channelParams?.channelId === channel._id}
                  onClick={() => router.navigate({ to: '/channel/$channelId', params: { channelId: channel._id } })}
                >
                  {channel.type === 'public' ? <Hash className="size-4" /> : <Lock className="size-4" />}
                  <span className="truncate">{channel.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="size-6 p-1 ml-auto opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100"
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
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

      {/* -------------------- Direct Messages Group -------------------- */}

      <SidebarGroup>
        <SidebarGroupLabel
          className="px-2 pr-1 relative gap-0.5 group/sidebar-label hover:bg-sidebar-accent cursor-pointer mb-[1px] select-none"
          onClick={() => setDirectMessagesOpen(!directMessagesOpen)}
        >
          <span className="text-xs">Direct Messages</span>
          <ChevronDown className={cn("size-3 transition-transform duration-200", !directMessagesOpen && "-rotate-90")} />
          <Button
            variant="ghost"
            className="size-6 p-1 items-center justify-center ml-auto opacity-0 group-hover/sidebar-label:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              // setCreateChannelDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent className={cn("transition-all duration-200 ease-in-out", !directMessagesOpen && "hidden")}>
          <SidebarMenu className="gap-[1px]">
            {org.memberships?.data?.map((member) => (
              <SidebarMenuItem key={member.id}>
                <SidebarMenuButton
                  className="group/workspace-item pr-1 relative"
                  // isActive={channelParams?.channelId === channel._id}
                  // onClick={() => router.navigate({ to: '/channel/$channelId', params: { channelId: channel._id } })}
                >
                  <div className='relative -ml-0.5'>
                    <img src={member.publicUserData?.imageUrl} alt={member.publicUserData?.firstName || ''} className="size-5 rounded" />
                    {presenceState?.find((presence) => presence.userId === member.publicUserData?.userId) && <span className="border-sidebar border-2 absolute -end-1 -bottom-1 size-3 rounded-full bg-green-600" />}
                  </div>
                  <span className="truncate">{member.publicUserData?.firstName} {member.publicUserData?.lastName}</span>
                  {user?.id === member.publicUserData?.userId && <span className="text-sm text-muted-foreground">you</span>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="size-6 p-1 ml-auto opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100"
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
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
  )
}
