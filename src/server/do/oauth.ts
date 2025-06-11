import { DurableObject } from "cloudflare:workers";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

interface State {
  counter: number;
  [key: string]: unknown;
}

const initialState: State = {
  counter: 0,
}

export class OAuth extends DurableObject<Env> {

  state: State;
  client = new Client({
    name: this.ctx.id.toString(),
    version: '1.0.0',
  })
  pendingAuths = new Map<string, (result: any) => void>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = initialState;
    this.ctx.blockConcurrencyWhile(async () => {
      this.state = await this.ctx.storage.get("state") || initialState;
    });
  }

  createTransport(name: string, url: string, redirectUrl: string, headers?: Record<string, string>) {
    const storage = this.ctx.storage;
    return new StreamableHTTPClientTransport(new URL(url), {
      requestInit: { headers },
      authProvider: {
        redirectUrl,
        clientMetadata: { redirect_uris: [redirectUrl] },
        redirectToAuthorization(authorizationUrl) {
          storage.put(`authUrl:${name}`, authorizationUrl.toString())
        },
        codeVerifier: async () => await storage.get(`codeVerifier:${name}`) as string,
        saveCodeVerifier: (cv) => storage.put(`codeVerifier:${name}`, cv),
        clientInformation: async () => await storage.get(`clientInfo:${name}`),
        saveClientInformation: (info) => storage.put(`clientInfo:${name}`, info),
        tokens: async () => await storage.get(`tokens:${name}`),
        saveTokens: (tokens) => storage.put(`tokens:${name}`, tokens),
      }
    })
  }

  async registerMcp(name: string, url: string, redirectUrl: string, headers?: Record<string, string>) {
    
    const client = this.client;
    const transport = this.createTransport(name, url, redirectUrl, headers);
    const sseTransport = new SSEClientTransport(new URL(url), {requestInit: {headers: headers}})
    
    try {
      await client.connect(transport);
      const tools = await client.listTools();
      client.close();
      return { tools };

    } catch (error) {

      const authUrl = await this.ctx.storage.get(`authUrl:${name}`);
      if (authUrl) {
        this.ctx.storage.delete(`authUrl:${name}`);
        return { authUrl };
      }

      console.log('error', error)
      console.log('using alternative sse transport')
      await client.connect(sseTransport)
      const tools = await client.listTools();
      client.close();
      return { tools };
    }
  }

  async completeAuth(sessionId: string, name: string, url: string, redirectUrl: string, headers?: Record<string, string>) {

    
    // Wait for the auth callback to provide the code
    const authResult = await new Promise<{ success: boolean; tools: any[]; code?: string }>((resolve) => {
      this.pendingAuths.set(sessionId, resolve);
    });

    if (authResult.success && authResult.code) {
      const transport = this.createTransport(name, url, redirectUrl, headers);
      await transport.finishAuth(authResult.code);
      const tools = await this.client.listTools();
      this.client.close();
      return { tools };
    }

    return { error: 'Auth failed' };
  }

  async resumeAuth(sessionId: string, code: string) {
    const resolve = this.pendingAuths.get(sessionId);
    if (resolve) {
      this.pendingAuths.delete(sessionId);
      resolve({ success: true, tools: [], code }); // Complete the waiting promise with the code
    }
  }
}