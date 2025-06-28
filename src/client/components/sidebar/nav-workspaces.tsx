import { ChevronRight, Ellipsis, FileText, Plus, Trash2, ChevronDown, Hash, Lock, Settings, UserPlus } from "lucide-react"
import React, { useState } from "react"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConvexMutation, convexQuery } from "@convex-dev/react-query";
import { convexApi, Id } from "@/lib/api";
import { useParams, useRouter } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/state";
import { CreateChannelDialog } from "@/components/dialog/create-channel";

export function NavWorkspaces() {
  
  const router = useRouter()
  const params = useParams({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false })
  const docId = params?.docId ?? '' as Id<'documents'>
  const [workspaceOpen, setWorkspaceOpen] = useState(true)
  const [channelsOpen, setChannelsOpen] = useState(true)
  
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const toggleWorkspace = (name: string) => {
    setOpenStates((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const { data: documents } = useQuery(
    convexQuery(convexApi.document.getDocuments, {})
  )

  // Channels
  const { data: channels } = useQuery(
    convexQuery(convexApi.channel.getChannels, {})
  )

  const { mutate: createDocument, isPending: isCreatingDocument } = useMutation({
    mutationFn: useConvexMutation(convexApi.document.createDocument),
    onSuccess: (data: { documentId: string }) => {
      router.navigate({ to: '/document/$docId', params: { docId: data.documentId }, search: { mode: 'editor' } })
    }
  });

  const { mutate: deleteDocument } = useMutation({
    mutationFn: useConvexMutation(convexApi.document.deleteDocument),
    onSuccess: () => {
      if (docId && documents?.find(doc => doc._id === docId)) {
        router.navigate({ to: '/dashboard' })
      }
    }
  });

  const { setCreateChannelDialogOpen } = useStore()

  // Params for active channel detection
  const channelParams = useParams({ from: '/_authenticated/_layout/channel/$channelId', shouldThrow: false }) as { channelId?: Id<'channels'> }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel 
          className="h-7 px-2 pr-1 relative gap-0.5 group/sidebar-label hover:bg-sidebar-accent cursor-pointer mb-0.5 select-none"
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
        >
          <span className="text-xs">Private</span>
          <ChevronDown className={cn("size-3.5 transition-transform duration-200", !workspaceOpen && "-rotate-90")} />
          <Button
            variant="ghost"
            className="size-5 p-0.75 items-center justify-center ml-auto hidden group-hover/sidebar-label:block hover:bg-zinc-300"
            onClick={(e) => {
              e.stopPropagation()
              createDocument({})
            }}
            disabled={isCreatingDocument}
          >
            <Plus className="size-3.5"/>
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent className={cn("transition-all duration-200 ease-in-out", !workspaceOpen && "hidden")}>
          <SidebarMenu className="gap-0.5">
            {documents?.map((document) => {
              const isOpen = openStates[document._id]
              return (
                <React.Fragment key={document._id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      className="group/workspace-item pr-1 h-7 relative"
                      isActive={docId === document._id}
                      onClick={() => router.navigate({ to: '/document/$docId', params: { docId: document._id }, search: { mode: 'editor' } })}
                    >
                      {document.emoji ? <span className="w-4 text-base leading-none">{document.emoji}</span> : <FileText className="size-4" />}
                      <span className="truncate">{document.title || 'New document'}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="size-5 p-0.75 ml-auto hidden group-hover/workspace-item:block data-[state=open]:block hover:bg-zinc-300"
                          >
                            <Ellipsis className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => deleteDocument({ docId: document._id })}>
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        asChild
                        variant="ghost"
                        className="absolute left-1.5 z-50 size-5 p-0.75 hidden group-hover/workspace-item:block bg-sidebar-accent hover:bg-zinc-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWorkspace(document._id)
                        }}
                      >
                        <span>
                          <ChevronRight className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}/>
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
          className="h-7 px-2 pr-1 relative gap-0.5 group/sidebar-label hover:bg-sidebar-accent cursor-pointer mb-0.5 select-none"
          onClick={() => setChannelsOpen(!channelsOpen)}
        >
          <span className="text-xs">Channels</span>
          <ChevronDown className={cn("size-3.5 transition-transform duration-200", !channelsOpen && "-rotate-90")} />
          <Button
            variant="ghost"
            className="size-5 p-0.75 items-center justify-center ml-auto hidden group-hover/sidebar-label:block hover:bg-zinc-300"
            onClick={(e) => {
              e.stopPropagation()
              setCreateChannelDialogOpen(true)
            }}
          >
            <Plus className="size-3.5" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent className={cn("transition-all duration-200 ease-in-out", !channelsOpen && "hidden")}>
          <SidebarMenu className="gap-0.5">
            {channels?.map((channel) => (
              <SidebarMenuItem key={channel._id}>
                <SidebarMenuButton
                  className="group/workspace-item pr-1 h-7 relative"
                  isActive={channelParams?.channelId === channel._id}
                  onClick={() => router.navigate({ to: '/channel/$channelId', params: { channelId: channel._id } })}
                >
                  {channel.type === 'public' ? <Hash className="size-4" /> : <Lock className="size-4" />}
                  <span className="truncate">{channel.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="size-5 p-0.75 ml-auto hidden group-hover/workspace-item:block data-[state=open]:block hover:bg-zinc-300"
                      >
                        <Ellipsis className="size-3.5" />
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
      <CreateChannelDialog />
    </>
  )
}
