import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { useStore } from "@/lib/state"
import { Button } from "../ui/button"
import { useMcpStore, DEFAULT_MCP_SERVERS } from "@/components/mcphost"
import { MCPServer } from "agents"
import { Loader, Plus } from "lucide-react"

export function IntegrationsDialog() {

  const { integrationsDialogOpen, setIntegrationsDialogOpen, setCustomMcpDialogOpen } = useStore()
  const { mcpState, addMcpServer, removeMcpServer } = useMcpStore()

  return (
    <CommandDialog open={integrationsDialogOpen} onOpenChange={setIntegrationsDialogOpen} showCloseButton={false}>
      <div className='relative'>
        <CommandInput placeholder="Search" wrapperClassName="border m-2 rounded-md" />
        <Button variant='ghost' className='size-6 p-0 absolute right-5 top-1/2 -translate-y-1/2' onClick={() => setCustomMcpDialogOpen(true)}>
          <Plus className="size-4" />
        </Button>
      </div>
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup>
          {Object.entries(DEFAULT_MCP_SERVERS).map(([name, config]) => {
            const client = Object.values(mcpState.servers).find((server: MCPServer) => server.name === name)
            const clientId = Object.keys(mcpState.servers).find((id: string) => mcpState.servers[id].name === name)
            return (
              <CommandItem 
                key={name} 
                value={name}
              >
                <div className="size-6 flex items-center justify-center mr-2">
                  {config.icon && <config.icon className="size-5" />}
                  {!config.icon && <div className="size-6 border rounded-md bg-muted flex items-center justify-center">{name.charAt(0).toUpperCase()}</div>}
                </div>
                <span>{name}</span>
                <CommandShortcut>
                  {!client && <Button size='sm' className='h-7' onClick={() => addMcpServer(name, config.url)}>Connect</Button>}
                  {/* {mcpClient && isLoading && <Button size='sm' disabled><Loader className="animate-spin" />Connect</Button>} */}
                  {client && clientId && <Button size='sm' variant='outline' className='h-7' onClick={() => {removeMcpServer(clientId)}}>Disconnect</Button>}
                </CommandShortcut>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
