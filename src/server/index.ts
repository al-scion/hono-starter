/// <reference types="../../worker-configuration.d.ts" />

import { Hono } from "hono";
import Stripe from 'stripe';
import { dbClient } from './db';

// Routers
import { userRouter } from './user';
import { testRouter } from "./test";

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof dbClient>;
    stripe: Stripe;
  }
}

const app = new Hono<{ Bindings: Env }>()

  .use('*', async (c, next) => {
    const db = dbClient(c.env.DATABASE_URL);
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    c.set('db', db);
    c.set('stripe', stripe);
    await next();
  })


  .route('/api/test', testRouter)
  .route('/api/user', userRouter);

export type AppType = typeof app;
export default app;
