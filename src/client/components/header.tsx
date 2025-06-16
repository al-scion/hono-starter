import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Box, Ellipsis, KeyRound, PanelLeft, PanelRight, Settings } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Kbd } from "@/components/shortcuts/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { convexApi, type Id } from "@/lib/api"
import { useParams, useSearch, useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { CopyToClipboard } from "./custom/copy"
import { useStore } from "@/lib/state"

export function Header() {

  const { setDeployDialogOpen } = useStore()
  const rightSidebar = useSidebar("right")
  const leftSidebar = useSidebar("left")
  const navigate = useNavigate()
  const params = useParams({ from: '/app/_layout/document/$docId', shouldThrow: false })
  const search = useSearch({ from: '/app/_layout/document/$docId', shouldThrow: false }) 
  const docId = params?.docId || undefined
  const routeOptions = ['editor', 'hybrid', 'canvas']

  const { data: document } = useQuery({
    ...convexQuery(convexApi.document.getDocument, { docId: docId as Id<'documents'> }),
    enabled: !!docId,
  })

  return (
    <header className="flex flex-row items-center w-full h-12 p-3 border-b">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className={"size-7 p-0" + (leftSidebar.state === 'expanded' && ' hidden')}
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
        <span className="text-sm">{document && document.title ? document.title : 'New document'}</span>
        <Button variant="ghost" className="size-7 p-0">
          <Ellipsis className="size-4" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">

        {search?.mode && <Tabs value={search.mode}>
          <TabsList className="h-7 p-0 rounded-md">
            {routeOptions.map((option) => (
              <TabsTrigger
              value={option}
              className={cn(
                "rounded-md px-0.5 text-muted-foreground shadow-none font-normal", 
                "data-[state=active]:border-border data-[state=active]:shadow-xs data-[state=active]:text-foreground",
              )}
              onClick={() => navigate({ to: '/app/document/$docId', params: { docId: docId as Id<'documents'> }, search: { mode: option as 'editor' | 'canvas' } })}
            >
              <span className={`h-6 px-1.5 flex items-center rounded-sm`}>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
            </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="blue" className="h-7 px-3 font-normal">
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
              <Button variant="ghost" className="size-7 p-0">
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
                className={"size-7 p-0" + (rightSidebar.state === 'expanded' && ' hidden')}
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