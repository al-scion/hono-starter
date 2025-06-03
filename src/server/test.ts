import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const testRouter = new Hono<{ Bindings: Env }>()
  .get('/', zValidator('query', z.object({
    name: z.string().min(1),
  })), async (c) => {
    const { name } = c.req.valid('query');
    return c.json({ message: `Hello, ${name}!` });
  })