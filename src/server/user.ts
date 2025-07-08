import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { users } from './db/schema';

export const userRouter = new Hono<{ Bindings: Env }>().get(
  '/',
  zValidator(
    'query',
    z.object({
      name: z.string().min(1),
    })
  ),
  async (c) => {
    const { name } = c.req.valid('query');
    const user = await c.var.db
      .select()
      .from(users)
      .where(eq(users.name, name));
    return c.json({ user: user[0] });
  }
);

export type UserRouterType = typeof userRouter;
