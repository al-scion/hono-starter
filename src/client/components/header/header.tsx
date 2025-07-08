import { Box, Ellipsis, KeyRound, PanelRight } from 'lucide-react';
import { Kbd } from '@/components/shortcuts/kbd';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { AgentTabs } from './agent-tabs';
import { BreadcrumbComponent } from './breadcrumb';
import { Facepile } from './facepile';

export function Header({
  className,
  ...props
}: React.ComponentProps<'header'>) {
  const { toggleRightSidebarCollapse } = useStore();

  return (
    <header
      className={cn(
        'flex h-10 w-full flex-row items-center border-b p-2',
        className
      )}
      {...props}
    >
      {/* Left section */}
      <div className="flex flex-1 items-center gap-1">
        <BreadcrumbComponent />
      </div>

      {/* Center section */}
      <div className="flex justify-center">
        <AgentTabs />
      </div>

      {/* Right section */}
      <div className="flex flex-1 items-center justify-end gap-1">
        <Facepile />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="size-6 p-0" variant="ghost">
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
              className={'size-6 p-0'}
              onClick={toggleRightSidebarCollapse}
              variant="ghost"
            >
              <PanelRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle sidebar
            <Kbd shortcutId="rightSidebarToggle" variant="secondary" />
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
