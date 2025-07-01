import { httpRouter } from 'convex/server'
import { httpAction } from "./_generated/server";
import { resend } from './email'
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter()

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    switch (event.type) {
      case "user.created": 
      case "user.updated":  
      await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: event.data.id!,
        });
        break;
      case "organization.created":
        await ctx.runMutation(internal.channel.createDefaultChannel, {
          createdBy: event.data.created_by!,
          organizationId: event.data.id!,
        })
        break;
      case "organization.deleted":
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateClerkRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  } as const;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook event", err);
    return null;
  }
}

export default http