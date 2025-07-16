import { httpAction, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { convertToModelMessages, smoothStream, streamText, UIMessage, createProviderRegistry } from "ai";
import { openai } from "@ai-sdk/openai";
import { UserMessageMetadata } from "@/lib/types";

const registry = createProviderRegistry(
  {
    openai,
  },
  { separator: '/' },
);

const hasDelimeter = (text: string) => {
  return text.includes(".") || text.includes("!") || text.includes("?");
};

export const createStreamingMessage = mutation({
  args: {
    agentId: v.id('agents'),
    channelId: v.id('channels'),
    streamingId: v.string(),
    threadId: v.optional(v.id('messages')),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('messages', {
      author: {
        type: 'agent',
        id: args.agentId
      },
      channelId: args.channelId,
      text: '',
      streamingId: args.streamingId,
      streamingStatus: 'streaming',
      threadId: args.threadId,
    })
  }
})

export const saveChunk = mutation({
  args: {
    messageId: v.id('messages'),
    text: v.string(),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { messageId, text } = args;
    await ctx.db.patch(messageId, {
      streamingText: text,
      ...(args.completed && { 
        streamingStatus: 'completed',
        text: text,
      })
    });
  }
})

export const stream = httpAction(async (ctx, req) => {

  const { messages }: { messages: UIMessage<UserMessageMetadata>[] } = await req.json();
  
  const lastMessage = messages[messages.length - 1];
  const agentId = lastMessage.metadata?.agentId;
  const channelId = lastMessage.metadata?.channelId;
  const threadId = lastMessage.metadata?.threadId;
  if (!agentId || !channelId) return new Response(null, { status: 400 });

  const modelMessages = convertToModelMessages(messages);


  const streamingId = crypto.randomUUID();

  const dbMessageId = await ctx.runMutation(api.chat.createStreamingMessage, {
    agentId,
    channelId,
    streamingId,
    threadId,
  })

  let accumulatedStream = '';

  const response = streamText({
    model: registry.languageModel('openai/gpt-4.1-mini'),
    messages: modelMessages,
    providerOptions: {},
    experimental_transform: smoothStream(),
    async onChunk({ chunk }) {
      if (chunk.type === 'text') {
        accumulatedStream += chunk.text;
        if (hasDelimeter(chunk.text)) {
          await ctx.runMutation(api.chat.saveChunk, {
            messageId: dbMessageId,
            text: accumulatedStream,
          });
        }
      }
    },
    async onFinish(result) {
      await ctx.runMutation(api.chat.saveChunk, {
        messageId: dbMessageId,
        text: result.steps.map((step) => step.text).join(''),
        completed: true,
      })
    },
    onError() {}
  });

  const stream = response.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
    generateMessageId: () => streamingId
  });

  stream.headers.set("Access-Control-Allow-Origin", "*");
  stream.headers.set("Vary", "Origin");

  return stream;
});

export const corsPreflight = httpAction(async (ctx, req) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
});