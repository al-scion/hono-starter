import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Box, Ellipsis, KeyRound, PanelLeft, PanelRight } from "lucide-react"
import { Kbd } from "@/components/shortcuts/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useChatStore } from "@/components/sidebar/chat"
import { BreadcrumbComponent } from "./breadcrumb"
import { Facepile } from "./facepile"
import { AgentTabs } from "./agent-tabs"

export function Header({
  className,
  ...props
}: React.ComponentProps<'header'>) {

  const { toggleSidebar } = useSidebar()
  const { toggleOpen } = useChatStore()

  return (
    <header className={cn(
      "flex flex-row items-center w-full h-10 p-2 border-b",
      'bg-background rounded-t-lg',
      className
    )}
    {...props}
    >
      {/* Left section */}
      <div className="flex items-center gap-1 flex-1">
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
        <BreadcrumbComponent />
      </div>

      {/* Center section */}
      <div className="flex justify-center">
        <AgentTabs />
      </div>

      {/* Right section */}
      <div className="flex flex-1 items-center gap-1 justify-end">
        <Facepile />
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