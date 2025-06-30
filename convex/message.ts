import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List messages in a channel, ordered by creation time ascending (oldest first)
export const listMessages = query({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const { channelId } = args;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_channel_createdAt', (q) => q.eq('channelId', channelId))
      .collect();

    return messages;
  },
});

// Send (create) a new message in a channel
export const sendMessage = mutation({
  args: {
    channelId: v.id('channels'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { channelId, text } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    const messageId = await ctx.db.insert('messages', {
      channelId,
      userId: user.subject,
      text,
      createdAt: Date.now(),
      reactions: [],
    });

    return { success: true, messageId };
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

    const message = await ctx.db.get(messageId);
    if (!message) return;

    await ctx.db.patch(messageId, {
      reactions: [
        ...message.reactions,
        {
          emoji,
          userId: user.subject,
        }
      ]
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

    const message = await ctx.db.get(messageId);
    if (!message) return;

    await ctx.db.patch(messageId, {
      reactions: message.reactions.filter(r => !(r.emoji === emoji && r.userId === user.subject))
    });

    return { success: true };
  },
});