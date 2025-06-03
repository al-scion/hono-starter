/// <reference types="../../worker-configuration.d.ts" />

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import Stripe from 'stripe';
import { dbClient } from './db';

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof dbClient>;
    stripe: Stripe;
  }
}

const app = new Hono<{ Bindings: Env }>()
  .use('*', async (c, next) => {
    const db = dbClient(c.env.DATABASE_URL);
    c.set('db', db);
    await next();
  })

  .get("/api/", (c) => c.json({ name: "Cloudflare" }))
  .get('/api/hello', (c) => {
    console.log(c.env.VAR_1);
    return c.json({ message: 'Hello, World!' });
  })
  .get('/api/hello', zValidator('query', z.object({
    name: z.string().min(1),
  })), async (c) => {
    const { name } = c.req.valid('query');
    return c.json({ message: `Hello, ${name}!` });
  });

export type AppType = typeof app;
export default app;
