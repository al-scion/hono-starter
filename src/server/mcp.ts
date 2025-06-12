import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamSSE } from "hono/streaming";
import { html } from "hono/html";

export const mcpRouter = new Hono<{ Bindings: Env }>()

  .post('/register', zValidator('json', z.object({
    name: z.string().min(1),
    url: z.string().url(),
    headers: z.record(z.string(), z.string()).optional(),
  })), async (c) => {
    
    const { name, url, headers } = c.req.valid('json');
    const oauth = c.var.oauth;
    const sessionId = crypto.randomUUID();
    const redirectUrl = c.req.url.replace('/register', '/oauth/callback') + `?session=${sessionId}`;

    return streamSSE(c, async (stream) => {

      const result = await oauth.registerMcp(name, url, redirectUrl, headers) as any;
      await stream.writeSSE({
        data: JSON.stringify(result),
      });
      
      if (result.authUrl) {
        const authResult = await oauth.completeAuth(sessionId, name, url, redirectUrl, headers) as any;
        await stream.writeSSE({
          data: JSON.stringify(authResult),
        });
      }

      return stream.close()
    });
  })

  .get('/oauth/callback', zValidator('query', z.object({
    session: z.string().min(1),
    code: z.string().min(1),
  })), async (c) => {
    const { session, code } = c.req.valid('query');
    const oauth = c.var.oauth;
    
    await oauth.resumeAuth(session, code);
    
    return c.html(html`<div>hello</div>`);
  })