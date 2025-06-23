import { DurableObject } from "cloudflare:workers";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";

interface State {
  registry: Record<string, {
    url: string;
    state: 'disconnected' | 'connecting' | 'connected'
    client: Client;
    transport: StreamableHTTPClientTransport | SSEClientTransport;
  }>;
  pendingConnections: Record<string, string>;
}

const initialState: State = {
  registry: {},
  pendingConnections: {},
}

export class MCPHost extends DurableObject<Env> {
  state: State;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = initialState;
    this.ctx.blockConcurrencyWhile(async () => {
      this.state = await this.ctx.storage.get("state") || initialState;
    });
  }

  private broadcast(payload: any) {
    const websockets = this.ctx.getWebSockets()
    for (const ws of websockets) {
      try {
        ws.send(JSON.stringify(payload))
      } catch (error) {
        console.log(error)
      }
    }
  }

  async handleAuthCallback(sessionId: string, code: string): Promise<Response> {
    const mcpName = this.state.pendingConnections[sessionId];
    const mcpClient = this.state.registry[mcpName]
    if (mcpName) {
      try {
        await mcpClient.transport.finishAuth(code)
        mcpClient.state = 'connected'
        delete this.state.pendingConnections[sessionId]
        return new Response(null, {status: 200, statusText: 'OK'})
      } catch (error) {
        console.log(error)
        return new Response(null, {status: 500, statusText: 'Internal Server Error'})
      }
    }
    return new Response(null, {status: 404, statusText: 'Not Found'})
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    const state = this.state
    const msg = JSON.parse(message)
    ws.send(`Echo: ${JSON.stringify(message)} (Connected sockets: ${this.ctx.getWebSockets().length})`);

    if (msg.type === 'connectMcpServer') {
      const { name, url, callbackUrl } = msg.data
      const sessionId = crypto.randomUUID()
      const storage = this.ctx.storage
      const client = new Client({name: 'mcp-host',version: '1.0.0'})
      
      const authProvider: OAuthClientProvider = {
        clientInformation: () => storage.get('clientInformation'),
        clientMetadata: {redirect_uris: [callbackUrl]},
        async codeVerifier() {return await storage.get('codeVerifier') || crypto.randomUUID()},
        redirectToAuthorization(authorizationUrl) {
          state.pendingConnections[sessionId] = name;
          ws.send(JSON.stringify({type: 'redirectToAuthorization', data: {authorizationUrl}}))
        },
        tokens() {return storage.get('tokens')},
        redirectUrl: callbackUrl,
        saveCodeVerifier(codeVerifier) {storage.put('codeVerifier', codeVerifier)},
        saveClientInformation(clientInformation) {storage.put('clientInformation', clientInformation)},
        saveTokens(tokens) {storage.put('tokens', tokens)},
        state() {return sessionId},
      }
      const httpTransport = new StreamableHTTPClientTransport(new URL(url), {authProvider})
      const sseTransport = new SSEClientTransport(new URL(url), {authProvider})

      try {
        await client.connect(httpTransport)
        console.log(await client.listTools())
      } catch (error) {
        console.log(error)
        if (!state.pendingConnections[sessionId]) {
          await client.connect(sseTransport)
          console.log(await client.listTools())
        }
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log('WebSocket closed:', { ws , code, reason, wasClean });
  }

  async fetch(request: Request): Promise<Response> {

    const upgrade = request.headers.get('Upgrade');
    if (upgrade && upgrade.toLowerCase() === 'websocket') {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    
    return new Response(null, { status: 404, statusText: 'Not Found' });
  }
}