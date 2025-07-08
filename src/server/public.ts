import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';

export const publicRouter = new Hono<{ Bindings: Env }>()
  .get('/', zValidator('query', z.object({
    name: z.string().min(1),
  })),
  async (c) => {
    const { name } = c.req.valid('query');
    return c.json({ message: `Hello, ${name}! This is a public route.` });
  })

  .post('/webhook/clerk', async (c) => {
    const payload = await c.req.text();
    const headers = c.req.header();
    const wh = new Webhook(c.env.CLERK_WEBHOOK_SECRET);
    const event = await wh.verify(payload, headers) as unknown as WebhookEvent;
    const clerk = c.var.clerk;

    switch (event.type) {
      case 'user.created':
        console.log('user created', event.data);
        const name = event.data.first_name ? event.data.first_name : event.data.email_addresses
        clerk.organizations.createOrganization({
          name: `${name}'s Workspace`,
        })
        break;
      case 'organization.created':
      default:
        console.log('Event not supported', event.type);
    }

    return c.json({ success: true });
  })

  .post('/webhook/stripe', async (c) => {
    const payload = await c.req.text();
    const signature = c.req.header('stripe-signature');
    const stripe = c.var.stripe;

    const event = await stripe.webhooks.constructEventAsync(
      payload, 
      signature!, 
      c.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.created':
        console.log('customer created', event.data);
        break;
      default:
        console.log('Event not supported')
    }

    return c.json({ success: true });
  })
