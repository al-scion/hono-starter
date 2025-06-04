/// <reference types="../../worker-configuration.d.ts" />

import { Hono } from "hono";
import Stripe from 'stripe';
import { dbClient } from './db';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

// Routers
import { userRouter } from './user';
import { testRouter } from "./test";
import { publicRouter } from "./public";

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof dbClient>;
    stripe: Stripe;
  }
}

const app = new Hono<{ Bindings: Env }>()

  .use('*', clerkMiddleware())
  .use('/api/*', async (c, next) => {
    if (c.req.path.startsWith('/api/public')) {return next();}
    const auth = getAuth(c);
    if (!auth?.userId) {return c.json({ error: 'Unauthorized', message: 'Authentication required' }, 401);}
    await next();
  })
  .use('*', async (c, next) => {
    const db = dbClient(c.env.DATABASE_URL);
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    c.set('db', db);
    c.set('stripe', stripe);
    await next();
  })
  .route('/api/public', publicRouter)
  .route('/api/test', testRouter)
  .route('/api/user', userRouter)

export type AppType = typeof app;
export default app;
