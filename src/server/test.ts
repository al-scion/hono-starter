import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
// import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
// import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export const testRouter = new Hono<{ Bindings: Env }>().get(
  '/',
  zValidator(
    'query',
    z.object({
      name: z.string().min(1),
    })
  ),
  async (c) => {
    const { name } = c.req.valid('query');
    return c.json({ message: `Hello, ${name}!` });
  }
);
