import { ChevronRight, Ellipsis, FileText, Plus, Trash2 } from "lucide-react"
import React, { useState } from "react"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConvexMutation, convexQuery } from "@convex-dev/react-query";
import { convexApi, Id } from "@/lib/api";
import { useParams, useRouter } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function NavWorkspaces() {
  
  const router = useRouter()
  const params = useParams({ from: '/app/_layout/document/$docId', shouldThrow: false })
  const docId = params?.docId ?? '' as Id<'documents'>
  
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const toggleWorkspace = (name: string) => {
    setOpenStates((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const { data: documents } = useQuery(
    convexQuery(convexApi.document.getDocuments, {})
  )

  const { mutate: createDocument } = useMutation({
    mutationFn: useConvexMutation(convexApi.document.createDocument),
    onSuccess: (data: { documentId: string }) => {
      router.navigate({ to: '/app/document/$docId', params: { docId: data.documentId }, search: { mode: 'editor' } })
    }
  });

  const { mutate: deleteDocument } = useMutation({
    mutationFn: useConvexMutation(convexApi.document.deleteDocument),
    onSuccess: () => {
      if (docId && documents?.find(doc => doc._id === docId)) {
        router.navigate({ to: '/app/dashboard' })
      }
    }
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 pr-1 group/sidebar-label hover:bg-sidebar-accent cursor-pointer mb-0.5">
        <span className="text-xs">Private</span>
        <div className="flex flex-row items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          className="size-6 p-1 ml-auto hidden group-hover/sidebar-label:block hover:bg-zinc-300"
          onClick={() => createDocument({})}
        >
          <Plus className="size-4"/>
        </Button>
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {documents?.map((document) => {
            const isOpen = openStates[document._id]
            return (
              <React.Fragment key={document._id}>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className="group/workspace-item pr-1 relative"
                    isActive={docId === document._id}
                    onClick={() => router.navigate({ to: '/app/document/$docId', params: { docId: document._id }, search: { mode: 'editor' } })}
                  >
                    {document.emoji ? <span className="w-4 text-base leading-none">{document.emoji}</span> : <FileText className="size-4" />}
                    <span className="truncate">{document.title || 'New document'}</span>
                    <div className="flex flex-row items-center gap-0.5 ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="size-6 p-1 opacity-0 group-hover/workspace-item:opacity-100 data-[state=open]:opacity-100 hover:bg-zinc-300"
                          >
                            <Ellipsis className="size-4" />
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
                        variant="ghost"
                        className="size-6 p-1 opacity-0 group-hover/workspace-item:opacity-100 hover:bg-zinc-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
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
                        <ChevronRight
                          className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                        />
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
  )
}
