import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { useStore } from "@/lib/state"
import { Button } from "../ui/button"
import { useState } from "react"
import { Input } from "../ui/input"
import { DialogTitle, DialogFooter, DialogDescription, DialogHeader } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"


const integrations = [{
  name: 'Linear',
  url: 'https://mcp.intercom.com/sse',
  auth: 'api'
}, {
  name: 'Context7',
  url: 'https://mcp.intercom.com/sse',
  auth: 'none'
}, {
  name: 'Neon',
  url: 'https://mcp.intercom.com/sse',
  auth: 'none'
}, {
  name: 'MCP',
  url: '',
  auth: 'api'
}]

const authOptions = [{
  value: "none",
  label: "None",
}, {
  value: "oauth",
  label: "OAuth",
}, {
  value: "api",
  label: "API key",
}, {
  value: "headers",
  label: "Headers",
}]

interface FormState {
  selectedIntegration: string | null
  builtInConfig: {
    apiKey: string
  }
  customMcpConfig: {
    name: string
    url: string
    auth: string
    apiKey: string
    headers: Array<{ header: string; value: string }>
  }
}

export function IntegrationsDialog() {
  const { integrationsDialogOpen, setIntegrationsDialogOpen } = useStore()
  
  const [formState, setFormState] = useState<FormState>({
    selectedIntegration: null,
    builtInConfig: {
      apiKey: ''
    },
    customMcpConfig: {
      name: '',
      url: '',
      auth: authOptions[0].value,
      apiKey: '',
      headers: [{ header: '', value: '' }]
    }
  })

  // Derived values for backward compatibility
  const selectedIntegration = formState.selectedIntegration
  const setSelectedIntegration = (value: string | null) => {
    setFormState(prev => ({ ...prev, selectedIntegration: value }))
  }

  const apiKey = formState.builtInConfig.apiKey
  const setApiKey = (value: string) => {
    setFormState(prev => ({
      ...prev,
      builtInConfig: { ...prev.builtInConfig, apiKey: value }
    }))
  }

  const customMcpName = formState.customMcpConfig.name
  const setCustomMcpName = (value: string) => {
    setFormState(prev => ({
      ...prev,
      customMcpConfig: { ...prev.customMcpConfig, name: value }
    }))
  }

  const customMcpUrl = formState.customMcpConfig.url
  const setCustomMcpUrl = (value: string) => {
    setFormState(prev => ({
      ...prev,
      customMcpConfig: { ...prev.customMcpConfig, url: value }
    }))
  }

  const customMcpAuth = formState.customMcpConfig.auth
  const setCustomMcpAuth = (value: string) => {
    setFormState(prev => ({
      ...prev,
      customMcpConfig: { ...prev.customMcpConfig, auth: value }
    }))
  }

  const customMcpHeaders = formState.customMcpConfig.headers
  const setCustomMcpHeaders = (headers: Array<{ header: string; value: string }>) => {
    setFormState(prev => ({
      ...prev,
      customMcpConfig: { ...prev.customMcpConfig, headers }
    }))
  }

  const customMcpApiKey = formState.customMcpConfig.apiKey
  const setCustomMcpApiKey = (value: string) => {
    setFormState(prev => ({
      ...prev,
      customMcpConfig: { ...prev.customMcpConfig, apiKey: value }
    }))
  }

  const configRequired = integrations.find((integration) => integration.name === selectedIntegration)?.auth === 'api'
  const isCustomMcp = selectedIntegration === 'MCP'

  return (
    <CommandDialog open={integrationsDialogOpen} onOpenChange={setIntegrationsDialogOpen}>

      {!configRequired && 
        <>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>
            <CommandGroup>
              {integrations.map((integration) => (
                <CommandItem key={integration.name} value={integration.name} onSelect={() => setSelectedIntegration(integration.name)}>
                  <img src={`/svg/${integration.name.toLowerCase()}.svg`} alt={integration.name} className="size-5" />
                  <span>{integration.name}</span>
                  <CommandShortcut>
                    <Button className="" size='sm'>
                      Connect
                    </Button>
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </>
      }



      {configRequired && (
          <div className="flex flex-col gap-6 p-4">

            <DialogHeader>
              <DialogTitle>Connect to {selectedIntegration}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col space-y-4">
              {!isCustomMcp && <div className="flex flex-col gap-2">
                <Label>API Key</Label>
                <Input type="text" placeholder={`${selectedIntegration} API key`} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>}

              {isCustomMcp && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>Name</Label>
                    <Input type="text" placeholder="My Custom MCP" value={customMcpName} onChange={(e) => setCustomMcpName(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>URL</Label>
                    <Input type="text" placeholder="https://mcp.example.com" value={customMcpUrl} onChange={(e) => setCustomMcpUrl(e.target.value)} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label>Authorization</Label>
                    <Select value={customMcpAuth} onValueChange={setCustomMcpAuth}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                        {authOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {customMcpAuth === 'api' && <Input
                      value={customMcpApiKey}
                      onChange={(e) => setCustomMcpApiKey(e.target.value)}
                      placeholder="Insert API key here"
                      type='password'
                      required
                    />}

                    {customMcpAuth === 'oauth' && 
                    <>
                    <Input
                      value={customMcpApiKey}
                      onChange={(e) => setCustomMcpApiKey(e.target.value)}
                      placeholder="Client ID"
                      type='text'
                      required
                    />
                    <Input
                      value={customMcpApiKey}
                      onChange={(e) => setCustomMcpApiKey(e.target.value)}
                      placeholder="Client Secret"
                      type='password'
                      required
                    />
                    </>
                    }

                    {customMcpAuth === 'headers' && 
                      <>
                        {customMcpHeaders.map((header, index) => (
                          <div className='flex flex-row items-center gap-2'>
                            <Input type='text' placeholder='header' value={header.header} onChange={(e) => setCustomMcpHeaders(customMcpHeaders.map((h, i) => i === index ? { ...h, header: e.target.value } : h))} />
                            <div className="relative w-full">
                              <Input type='text' placeholder='value' value={header.value} onChange={(e) => setCustomMcpHeaders(customMcpHeaders.map((h, i) => i === index ? { ...h, value: e.target.value } : h))} />
                              <Button variant='ghost' className='absolute top-1/2 right-2 -translate-y-1/2 size-6 p-0' onClick={() => setCustomMcpHeaders(customMcpHeaders.filter((_, i) => i !== index))}>
                                <X className='size-4' />
                              </Button>
                            </div>
                          </div>)
                        )}
                        <Button 
                          variant='secondary'
                          size='sm'
                          className="w-fit"
                          onClick={() => setCustomMcpHeaders([...customMcpHeaders, { header: '', value: '' }])}>
                          Add header
                        </Button>
                      </>
                    }

                  </div>

                </>  
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Back
              </Button>
              <Button disabled={!apiKey}>
                Connect
              </Button>
            </DialogFooter>     
          </div>
      )}

    </CommandDialog>
  )
}
