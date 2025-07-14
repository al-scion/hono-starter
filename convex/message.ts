import { v } from 'convex/values';
import { action, mutation, query } from './_generated/server';
import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';

import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// List messages in a channel, ordered by creation time ascending (oldest first)
export const listMessages = query({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const { channelId } = args;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_channel', (q) => q.eq('channelId', channelId))
      .order('asc')
      .collect();

    return messages;
  },
});

export const getMessage = query({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const { threadId } = args;
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .order('asc')
      .collect();

    return messages;
  },
});

// Send (create) a new message in a channel
export const sendMessage = mutation({
  args: {
    channelId: v.id('channels'),
    text: v.string(),
    threadId: v.optional(v.id('messages')),
    files: v.optional(v.array(v.id('_storage'))),
    agentId: v.optional(v.id('agents')),
    status: v.optional(v.union(v.literal('pending'), v.literal('streaming'), v.literal('completed'))),
  },
  handler: async (ctx, args) => {
    const { channelId, text } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    const messageId = await ctx.db.insert('messages', {
      channelId,
      author: args.agentId ? { type: 'agent', id: args.agentId } : { type: 'user', id: user.subject },
      text,
      status: args.status || 'completed',
      threadId: args.threadId,
      files: args.files,
    });

    return messageId;
  },
});

export const listReactions = query({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const { messageId } = args;
    return await ctx.db.query('messageReactions').withIndex('by_message', (q) => q.eq('messageId', messageId)).collect();
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id('messages'),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const { messageId, emoji } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    await ctx.db.insert('messageReactions', {
      messageId,
      emoji,
      author: { type: 'user', id: user.subject },
    });

    return { success: true };
  },
});

export const removeReaction = mutation({
  args: {
    messageId: v.id('messages'),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const { messageId, emoji } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    const reaction = await ctx.db.query('messageReactions')
    .withIndex('by_author_message_emoji', (q) => q.eq('author.id', user.subject).eq('messageId', messageId).eq('emoji', emoji))
    .first();
    if (!reaction) throw new Error('Reaction not found');
    await ctx.db.delete(reaction._id);
    return { success: true };
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id('messages'),
    text: v.string(),
    status: v.optional(v.union(v.literal('pending'), v.literal('streaming'), v.literal('completed'))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { 
      text: args.text, 
      ...(args.status && { status: args.status })
    });
    return { success: true };
  },
});

export const sendAIMessage = action({
  args: {
    channelId: v.id('channels'),
    agentId: v.id('agents'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    let response = ''
    let messageId: Id<'messages'> | null = null

    const hasDelimeter = (text: string) => {
      return text.includes(".") || text.includes("!") || text.includes("?");
    };

    const handleAddMessage = async () => {
      if (!messageId) {
        messageId = await ctx.runMutation(api.message.sendMessage, {
          channelId: args.channelId,
          text: response,
          agentId: args.agentId,
          status: 'streaming'
        });
      } else {
        await ctx.runMutation(api.message.updateMessage, {
          messageId,
          text: response
        })
      }
    }

    const { textStream } = streamText({
      model: openai('gpt-4o-mini'),
      prompt: args.text,
      onChunk() {},
      onFinish() {}
    });

    for await (const chunk of textStream) {
      response += chunk;
      if (hasDelimeter(chunk)) {
        handleAddMessage()
      }
    }

    if (messageId) {
      await ctx.runMutation(api.message.updateMessage, {
        messageId,
        text: response,
        status: 'completed'
      })
    }
  }
})