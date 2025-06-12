import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const publicRouter = new Hono<{ Bindings: Env }>()
  .get('/', zValidator('query', z.object({
    name: z.string().min(1),
  })), async (c) => {
    const { name } = c.req.valid('query');
    return c.json({ message: `Hello, ${name}! This is a public route.` });
  })


  .get('/auth-callback', async (c) => {

    // TO DO: proper handling of the auth callback
    const params = c.req.query();
    console.log(params);

    return c.json({ success: true });
  })