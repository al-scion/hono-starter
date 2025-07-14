import type { MCPServer } from 'agents';
import { Loader, Plus } from 'lucide-react';
import { DEFAULT_MCP_SERVERS, useMcpStore } from '@/components/mcphost';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { useStore } from '@/lib/state';
import { TooltipButton } from '../custom/tooltip-button';

export function IntegrationsDialog() {
  const {
    integrationsDialogOpen,
    setIntegrationsDialogOpen,
    setCustomMcpDialogOpen,
  } = useStore();
  const { mcpState, addMcpServer, removeMcpServer } = useMcpStore();

  return (
    <CommandDialog
      onOpenChange={setIntegrationsDialogOpen}
      open={integrationsDialogOpen}
      showCloseButton={false}
    >
      <div className="relative">
        <CommandInput
          placeholder="Search"
          wrapperClassName="border m-2 rounded-md"
        />
        <TooltipButton
          className="-translate-y-1/2 absolute top-1/2 right-5 size-6 p-0"
          onClick={() => {
            setCustomMcpDialogOpen(true);
            setIntegrationsDialogOpen(false);
          }}
          variant="ghost"
          tooltip="Custom MCP server"
        >
          <Plus className="size-4" />
        </TooltipButton>
      </div>
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup>
          {Object.entries(DEFAULT_MCP_SERVERS).map(([name, config]) => {
            const client = Object.values(mcpState.servers).find(
              (server: MCPServer) => server.name === name
            );
            const clientId = Object.keys(mcpState.servers).find(
              (id: string) => mcpState.servers[id].name === name
            );
            const isLoading =
              client &&
              (client.state === 'authenticating' ||
                client.state === 'connecting' ||
                client.state === 'discovering');
            return (
              <CommandItem key={name} value={name}>
                <div className="mr-2 flex size-6 items-center justify-center">
                  {config.icon && <config.icon className="size-5" />}
                  {!config.icon && (
                    <div className="flex size-6 items-center justify-center rounded-md border bg-muted">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span>{name}</span>
                <CommandShortcut>
                  {!client && (
                    <TooltipButton
                      className="h-7"
                      onClick={() => addMcpServer(name, config.url)}
                      size="sm"
                    >
                      Connect
                    </TooltipButton>
                  )}
                  {client && isLoading && (
                    <TooltipButton className="h-7" disabled size="sm">
                      <Loader className="animate-spin" />
                      Connect
                    </TooltipButton>
                  )}
                  {client && !isLoading && clientId && (
                    <TooltipButton
                      className="h-7"
                      onClick={() => {
                        removeMcpServer(clientId);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Disconnect
                    </TooltipButton>
                  )}
                </CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
