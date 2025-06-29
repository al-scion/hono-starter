/// <reference types="../../worker-configuration.d.ts" />

import { Hono } from "hono";
import { logger } from "hono/logger";
import Stripe from 'stripe';
import { dbClient } from './db';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

// Model Providers
import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ElevenLabsClient } from "elevenlabs";

// Routers
import { userRouter } from './user';
import { chatRouter } from './chat';
import { testRouter } from "./test";
import { publicRouter } from "./public";
import { mcpRouter } from "./mcp";

// Durable Objects
export { Agent } from "./do/agent";

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof dbClient>;
    stripe: Stripe;
    registry: ReturnType<typeof createProviderRegistry>;
    elevenlabs: ElevenLabsClient;
  }
}

const app = new Hono<{ Bindings: Env }>()

  .use('*', logger())
  .use('*', clerkMiddleware())
  .use('/api/*', async (c, next) => {
    if (c.req.path.startsWith('/api/public')) {return next();}
    const auth = getAuth(c);
    if (!auth?.userId) {return c.json({ error: 'Unauthorized', message: 'Authentication required' }, 401)}
    await next();
  })
  .use('*', async (c, next) => {
    const baseURL = `https://gateway.ai.cloudflare.com/v1/${c.env.CLOUDFLARE_ACCOUNT_ID}/${c.env.CLOUDFLARE_GATEWAY_NAME}`;
    const headers = {'cf-aig-authorization': `Bearer ${c.env.CLOUDFLARE_AIG_TOKEN}`};
    const modelRegistry = createProviderRegistry({
      openai: createOpenAI({baseURL: `${baseURL}/openai`, headers, apiKey: c.env.OPENAI_API_KEY}),
      anthropic: createAnthropic({baseURL: `${baseURL}/anthropic`, headers, apiKey: c.env.ANTHROPIC_API_KEY}),
      google: createGoogleGenerativeAI({baseURL: `${baseURL}/google-ai-studio/v1beta`, headers, apiKey: c.env.GOOGLE_GENERATIVE_AI_API_KEY}),
    }, {
      separator: '/'
    })
    const db = dbClient(c.env.DATABASE_URL);
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    const elevenlabs = new ElevenLabsClient({apiKey: c.env.ELEVENLABS_API_KEY});
    c.set('registry', modelRegistry);
    c.set('db', db);
    c.set('stripe', stripe);
    c.set('elevenlabs', elevenlabs);
    return next();
  })
  .route('/api/public', publicRouter)
  .route('/api/test', testRouter)
  .route('/api/user', userRouter)
  .route('/api/chat', chatRouter)
  .route('/api/mcp', mcpRouter)

export type AppType = typeof app;
export default app;
