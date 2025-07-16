import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { resend } from './email';
import { stream, corsPreflight } from './chat';

const http = httpRouter();

http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});


http.route({
  path: '/stream',
  method: 'POST',
  handler: stream,
});

http.route({
  path: '/stream',
  method: 'OPTIONS',
  handler: corsPreflight,
});

export default http;
