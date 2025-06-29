import { create } from "zustand"
import { Notion, Linear, Asana, PayPal, Github, Neon } from "@/lib/icons"
import { api } from "@/lib/api"

// MCP related imports
import { useAgent } from "agents/react";
import type { MCPServersState } from "agents";

export const DEFAULT_MCP_SERVERS: Record<string, any> = {
  'Notion': {url: 'https://mcp.notion.com/mcp', icon: Notion},
  'Linear': {url: 'https://mcp.linear.app/sse', icon: Linear},
  'Asana': {url: 'https://mcp.asana.com/sse', icon: Asana},
  'Github': {url: 'https://api.githubcopilot.com/mcp', icon: Github},
  'Neon': {url: 'https://mcp.neon.tech/sse', icon: Neon},
  'Context7': {url: 'https://mcp.context7.com/mcp'},
  'Stripe': {url: 'https://mcp.stripe.com'},
  'Intercom': {url: 'https://mcp.intercom.com/sse'},
  'Deepwiki': {url: 'https://mcp.deepwiki.com/sse'},
  'Hubspot': {url: 'https://app.hubspot.com/mcp/v1/http'},
  'Zapier': {url: 'https://mcp.zapier.com/api/mcp/mcp'},
  'Square': {url: 'https://mcp.squareup.com'},
  'Paypal': {url: 'https://mcp.paypal.com/sse', icon: PayPal},
}

interface McpStore {
  agent: ReturnType<typeof useAgent> | undefined
  setAgent: (agent: ReturnType<typeof useAgent>) => void

  mcpState: MCPServersState
  setMcpState: (mcpState: MCPServersState) => void

  agentState: unknown
  setAgentState: (agentState: unknown) => void

  addMcpServer: (name: string, url: string) => Promise<void>
  removeMcpServer: (id: string) => Promise<void>

  pendingAuthSessions: Set<string>
  setPendingAuthSessions: (pendingAuthSessions: Set<string>) => void

  enabledMcp: Set<string>
  addEnabledMcp: (mcp: string) => void
  removeEnabledMcp: (mcp: string) => void
}

export const useMcpStore = create<McpStore>(
  (set, get) => ({
    agent: undefined,
    setAgent: (agent) => set({ agent }),

    mcpState: {
      servers: {},
      tools: [],
      prompts: [],
      resources: [],
    },
    setMcpState: (mcpState) => set({ mcpState }),
    removeMcpServer: async (id: string) => {await api.mcp.removeMcp.$delete({ json: { id } })},
    addMcpServer: async (name, url) => {
      // Check if there's already an authenticating server with this name
      const existingServer = Object.entries(get().mcpState.servers).find(([_, server]) => 
        server.name === name &&
        server.auth_url && 
        server.state === 'authenticating'
      )
      
      if (existingServer) {
        window.open(existingServer[1].auth_url!, '_blank')
        return
      }
      
      const response = await api.mcp.addMcp.$post({ json: { name, url } })
      const { id, authUrl } = await response.json()
      if (authUrl) {
        window.open(authUrl, '_blank')
        get().setPendingAuthSessions(new Set([...get().pendingAuthSessions, id]))
      }
    },

    agentState: undefined,
    setAgentState: (agentState) => set({ agentState }),

    pendingAuthSessions: new Set(),
    setPendingAuthSessions: (pendingAuthSessions) => set({ pendingAuthSessions }),

    enabledMcp: new Set(),
    addEnabledMcp: (mcp) => set({ enabledMcp: new Set([...get().enabledMcp, mcp]) }),
    removeEnabledMcp: (mcp) => set({ enabledMcp: new Set([...get().enabledMcp].filter(m => m !== mcp)) }),
  })
)
  
export function McpHost() {
  const { setAgent, setMcpState, setAgentState } = useMcpStore()

  const agentConnection = useAgent<any, unknown>({
    prefix: 'api/mcp', // Constructs a url path with /<prefix>/<agent>/<name>
    agent: 'agent', // Name of the durable object
    name: 'anonymous',  // Name of the agent instance, defaults to "default"
    onOpen: () => {setAgent(agentConnection)},
    onClose: () => {},
		onMcpUpdate: setMcpState,
    onStateUpdate: setAgentState,
    onMessage: (event) => {console.log('message', event)},
    onError: (error) => {console.error('error', error)},
  })

  return null
}