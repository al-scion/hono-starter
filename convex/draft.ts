import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const getDrafts = query({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const { channelId } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    return await ctx.db.query('drafts')
    .withIndex('by_user_channel', (q) => q.eq('userId', user.subject).eq('channelId', channelId))
    .first();
  },
});

export const saveDraft = mutation({
  args: {
    channelId: v.id('channels'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { channelId, text } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    const existingDraft = await ctx.db.query('drafts')
      .withIndex('by_user_channel', (q) => q.eq('userId', user.subject).eq('channelId', channelId))
      .first();

    if (existingDraft) {
      await ctx.db.patch(existingDraft._id, { text });
    } else {
      await ctx.db.insert('drafts', {
        userId: user.subject,
        channelId,
        text,
      });
    }
  },
});

export const deleteDraft = mutation({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const { channelId } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    await ctx.db.query('drafts')
    .withIndex('by_user_channel', (q) => q.eq('userId', user.subject).eq('channelId', channelId))
    .collect()
    .then((drafts) => {
      return Promise.all(drafts.map((draft) => ctx.db.delete(draft._id)));
    }); 
  },
});