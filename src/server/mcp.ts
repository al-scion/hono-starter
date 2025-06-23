import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getAgentByName, routeAgentRequest } from "agents";

export const mcpRouter = new Hono<{ Bindings: Env }>()
  .all('/agent/*', async (c) => {
    const resp = await routeAgentRequest(c.req.raw, c.env, { cors: true, prefix: 'api/mcp' });
    return resp ?? c.json({ error: "not found" }, 404);
  })
  .post('/addMcp', zValidator('json', z.object({
    name: z.string(),
    url: z.string(),
  })), async (c) => {
    const { name, url } = c.req.valid('json');
    const userId = c.var.clerkAuth?.userId || 'anonymous';
    const agent = await getAgentByName(c.env.AGENT, userId);
    const { id, authUrl } = await agent.addMcpServer(
      name,
      url,
      new URL(c.req.url).origin,
      'api/mcp',
    )
    console.log('addMcp', id, authUrl)
    return c.json({ id, authUrl });
  })
  .delete('/removeMcp', zValidator('json', z.object({
    id: z.string(),
  })), async (c) => {
    const { id } = c.req.valid('json');
    const userId = c.var.clerkAuth?.userId || 'anonymous';
    const agent = await getAgentByName(c.env.AGENT, userId);
    await agent.removeMcpServer(id);
    return c.json({ success: true });
  })
