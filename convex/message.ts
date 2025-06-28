import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List messages in a channel, ordered by creation time ascending (oldest first)
export const listMessages = query({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const { channelId } = args;
    return await ctx.db
      .query('messages')
      .withIndex('by_channel_createdAt', (q) => q.eq('channelId', channelId))
      .collect();
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
    });

    return { success: true, messageId };
  },
}); 