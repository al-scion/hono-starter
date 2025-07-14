import { mutation, query, action, httpAction } from "./_generated/server";
import { components } from "./_generated/api";
import { PersistentTextStreaming, StreamId, StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming
);

export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId
    );
  },
});

export const genText = action({
  args: {
    agentId: v.id('agents'),
    messageId: v.id('messages'),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.runQuery(api.agent.getAgent, { agentId: args.agentId });
    const message = await ctx.runQuery(api.message.getMessage, { messageId: args.messageId });
    const response = streamText({
      model: openai('gpt-4o'),
      prompt: args.prompt,
      system: agent?.system,
    })

  }
}) 