import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Box, Ellipsis, FileText, KeyRound, PanelLeft, PanelRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Kbd } from "@/components/shortcuts/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useQuery, useMutation } from "@tanstack/react-query"
import { convexApi, type Id } from "@/lib/api"
import { useParams, useSearch, useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from "./custom/emoji-picker"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useState } from "react"
import { useChatStore } from "@/components/sidebar/chat"
import { Input } from "./ui/input"
import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";
import { useUser } from "@clerk/clerk-react"


export function Header({
  className,
  ...props
}: React.ComponentProps<'header'>) {

  const { user } = useUser()
  const presenceState = usePresence(convexApi.presence, "my-chat-room", user?.id || "")
  const { toggleSidebar } = useSidebar()
  const { toggleOpen } = useChatStore()
  const navigate = useNavigate()
  const params = useParams({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false })
  const search = useSearch({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false }) 
  const docId = params?.docId || undefined
  const routeOptions = ['editor', 'canvas', 'logs', 'evaluation']
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  const { data: document } = useQuery({
    ...convexQuery(convexApi.document.getDocument, { docId: docId as Id<'documents'> }),
    enabled: !!docId,
  })

  const { mutate: mutateEmoji } = useMutation({
    mutationFn: useConvexMutation(convexApi.document.updateEmoji).withOptimisticUpdate(
      (localStore, args) => {
        const { docId, emoji } = args
        const existingDocs = localStore.getQuery(convexApi.document.getDocuments, {})
        const currentDocument = localStore.getQuery(convexApi.document.getDocument, { docId })
        if (existingDocs !== undefined) {
          const updatedDocs = existingDocs.map((doc) => doc._id === docId ? { ...doc, emoji } : doc)
          localStore.setQuery(convexApi.document.getDocuments, {}, updatedDocs)
        }
        if (currentDocument) {
          localStore.setQuery(convexApi.document.getDocument, { docId }, {
            ...currentDocument,
            emoji
          })
        }
      }
    ),
  })

  return (
    <header className={cn(
      "flex flex-row items-center w-full h-10 p-2 border-b",
      'bg-background rounded-t-lg',
      className
    )}
    {...props}
    >
      <div className="flex items-center gap-2 flex-1">

        <div className={cn("flex flex-row items-center")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className='size-6 p-0'
                onClick={() => toggleSidebar()}
              >
                <PanelLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle sidebar
              <Kbd shortcutId="leftSidebarToggle" variant="secondary"/>
            </TooltipContent>
          </Tooltip>
          <div className='border-l h-5 ml-2' />
        </div>

        {/* Title component */}
        <div className='flex flex-row items-center'>
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="size-6 p-1">
                {document && document.emoji ? <span className="text-base leading-none">{document.emoji}</span> : <FileText className="size-4" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-fit h-64 overflow-y-auto">
              <EmojiPicker onEmojiSelect={(emoji) => {
                mutateEmoji({ docId: docId as Id<'documents'>, emoji: emoji.emoji })
                setIsEmojiPickerOpen(false)
              }}>
                <EmojiPickerSearch />
                <EmojiPickerContent />
              </EmojiPicker>
            </PopoverContent>
          </Popover>
          <Input value={document?.title} className='shadow-none px-1 h-6 border-transparent hover:border-border focus-visible:ring-2 rounded-sm font-medium' />
        </div>

      </div>

      {search?.mode && (
        <div className="flex justify-center">
          <Tabs value={search.mode}>
            <TabsList className="h-7 p-0 rounded-md">
              {routeOptions.map((option) => (
                <TabsTrigger
                key={option}
                value={option}
                className={cn(
                  "rounded-md px-0.5 text-muted-foreground shadow-none font-normal", 
                  "data-[state=active]:border-border data-[state=active]:shadow-xs data-[state=active]:text-foreground",
                )}
                onClick={() => navigate({ to: '/document/$docId', params: { docId: docId as Id<'documents'> }, search: { mode: option as any } })}
              >
                <span className={`h-6 px-1.5 flex items-center rounded-sm`}>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex flex-1 items-center gap-1 justify-end">
        <div className="w-fit">
          <FacePile presenceState={presenceState || []} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-6 p-0">
              <Ellipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Box className="size-4" />
              Integrations
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound className="size-4" />
              Variables
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className={`size-6 p-0`}
              onClick={() => toggleOpen()}
            >
              <PanelRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle sidebar
            <Kbd shortcutId="rightSidebarToggle" variant="secondary"/>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}