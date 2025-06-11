import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import { z } from 'zod'

// Define state type interface
interface State {
  counter: number
}


export class MyMCP extends McpAgent<Env, State, Record<string, unknown>> {

  server = new McpServer({
    name: 'mcp-server', 
    version: "1.0.0",
    description: "A server for the MCP protocol",
  })

  initialState = {
    counter: 1,
  }
  
	async init() {

    this.server.resource("credits", "mcp://credits", (uri) => {
      return {
        contents: [{ uri: uri.href, text: this.state.counter.toString() }],
      }
    })
    
    this.server.tool(
      "add", 
      "add two numbers together", 
      { a: z.number(), b: z.number() }, 
      async ({ a, b }) => {
        const sum = a + b
        return {
          content: [{ type: "text", text: String(sum) }],
        }
      }
    );

    // Add a tool or resource here
	}

  onStateUpdate(state: State) {
    console.log("State updated", state)
  }

}