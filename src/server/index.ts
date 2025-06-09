/// <reference types="../../worker-configuration.d.ts" />

import { Hono } from "hono";
import Stripe from 'stripe';
import { dbClient } from './db';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

// Model Providers
import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Routers
import { userRouter } from './user';
import { chatRouter } from './chat';
import { testRouter } from "./test";
import { publicRouter } from "./public";

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof dbClient>;
    stripe: Stripe;
    registry: ReturnType<typeof createProviderRegistry>;
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
    const aiGateway = c.env.AI.gateway(c.env.CLOUDFLARE_GATEWAY_NAME);
    const baseURL = await aiGateway.getUrl();
    const headers = {'cf-aig-authorization': `Bearer ${c.env.CLOUDFLARE_AIG_TOKEN}`};
    const modelRegistry = createProviderRegistry({
      openai: createOpenAI({baseURL: `${baseURL}openai`, headers, apiKey: c.env.OPENAI_API_KEY}),
      anthropic: createAnthropic({baseURL: `${baseURL}anthropic`, headers, apiKey: c.env.ANTHROPIC_API_KEY}),
      google: createGoogleGenerativeAI({baseURL: `${baseURL}google-ai-studio/v1beta`, headers, apiKey: c.env.GOOGLE_GENERATIVE_AI_API_KEY}),
      // groq: createGroq({baseURL: `${baseURL}/groq`, headers, apiKey: c.env.GROQ_API_KEY}),
      // xai: createXai({baseURL: `${baseURL}/xai`, headers, apiKey: c.env.XAI_API_KEY}),
      // fireworks: createFireworks({baseURL, headers, apiKey: c.env.FIREWORKS_API_KEY}),
    }, {
      separator: '/'
    })

    // const model = modelRegistry.languageModel('google/gemini-2.5-flash-preview-04-17');
    c.set('registry', modelRegistry);
    return next();
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
  .route('/api/chat', chatRouter)

export type AppType = typeof app;
export default app;
