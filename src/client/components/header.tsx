import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Box, FileText, KeyRound, PanelLeft, PanelRight, Settings } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Kbd } from "@/components/shortcuts/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useQuery, useMutation } from "@tanstack/react-query"
import { convexApi, type Id } from "@/lib/api"
import { useParams, useSearch, useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { CopyToClipboard } from "./custom/copy"
import { useStore } from "@/lib/state"
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from "./custom/emoji-picker"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useState } from "react"

export function Header() {

  const { setDeployDialogOpen } = useStore()
  const rightSidebar = useSidebar("right")
  const leftSidebar = useSidebar("left")
  const navigate = useNavigate()
  const params = useParams({ from: '/app/_layout/document/$docId', shouldThrow: false })
  const search = useSearch({ from: '/app/_layout/document/$docId', shouldThrow: false }) 
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
    <header className="flex flex-row items-center w-full h-12 p-3 border-b">
      <div className="flex items-center gap-2 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className={`size-6 p-0 ${leftSidebar.state === 'expanded' ? 'hidden' : ''}`}
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

        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-7 px-2 gap-2 [&>svg]:text-foreground">
              {document && document.emoji ? <span className="w-4 text-base leading-none">{document.emoji}</span> : <FileText className="size-4" />}
              <span className="text-sm font-medium truncate">{document && document.title ? document.title : 'New document'}</span>
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
                onClick={() => navigate({ to: '/app/document/$docId', params: { docId: docId as Id<'documents'> }, search: { mode: option as any } })}
              >
                <span className={`h-6 px-1.5 flex items-center rounded-sm`}>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex items-center gap-2 flex-1 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="blue" className="h-6 px-2 font-normal">
              Deploy
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-80' align="end">
            <div className="flex flex-row items-center rounded-md bg-muted text-sm p-2 relative">
              <span>https://mcp.domain.com/sse</span>
              <CopyToClipboard text="https://mcp.domain.com/sse" className="ml-auto border-none bg-transparent shadow-none size-4" />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeployDialogOpen(true)}>Redeploy</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-6 p-0">
                <Settings className="size-4" />
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
                className={`size-6 p-0 ${rightSidebar.state === 'expanded' ? 'hidden' : ''}`}
                onClick={() => rightSidebar.toggleSidebar()}
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
      </div>
    </header>
  )
}