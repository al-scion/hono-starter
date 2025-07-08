import { httpRouter } from 'convex/server';
import { api } from './_generated/api';
import { httpAction } from './_generated/server';
import { resend } from './email';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Id } from './_generated/dataModel';

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
  handler: httpAction(async (ctx, req) => {

    const { channelId } = await req.json() as { channelId: Id<'channels'> };

    let responseText = ''
    const messageId = await ctx.runMutation(api.message.sendMessage, {
      channelId,
      text: responseText,
    });

    const response = streamText({
      model: openai('gpt-4o-mini'),
      prompt: "Hello world",
      onChunk({chunk}) {
        if (chunk.type === 'text') {
          responseText += chunk.text;
          ctx.runMutation(api.message.updateMessage, {
            messageId: messageId,
            text: responseText,
          })
        }
      },
    });

    return response.toUIMessageStreamResponse({
      sendReasoning: true,
      sendSources: true,
    });
  }),
})

export default http;
