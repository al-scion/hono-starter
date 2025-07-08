import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';

export const createChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal('public'),
      v.literal('private'),
      v.literal('direct')
    ),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const { name, description, type, organizationId } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const channelId = await ctx.db.insert('channels', {
      name,
      description,
      type,
      organizationId,
    });

    ctx.db.insert('channelMembers', {
      channelId,
      memberId: user.subject,
      role: 'admin',
    });

    return channelId;
  },
});

export const getChannels = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query('channels')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', organizationId)
      )
      .collect();
  },
});

export const joinChannel = mutation({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, { channelId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }

    await ctx.db.insert('channelMembers', {
      channelId,
      memberId: user.subject,
      role: 'member',
    });

    return { success: true };
  },
});

export const createDefaultChannel = internalMutation({
  args: {
    organizationId: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, { organizationId, createdBy }) => {
    const channelId = await ctx.db.insert('channels', {
      name: 'general',
      type: 'public',
      organizationId,
    });

    return channelId;
  },
});

export const deleteChannel = mutation({
  args: { channelId: v.id('channels') },
  handler: async (ctx, { channelId }) => {
    await ctx.db.delete(channelId);
  },
});

export const handleOrganizationDeleted = internalMutation({
  args: { organizationId: v.string() },
  async handler(ctx, { organizationId }) {
    // fetch all channels for the org in one round-trip
    const channels = await ctx.db
      .query('channels')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', organizationId)
      )
      .collect();

    // run channel clean-up in parallel
    await Promise.all(
      channels.map(async (channel) => {
        // delete messages
        const messages = await ctx.db
          .query('messages')
          .withIndex('by_channel', (q) => q.eq('channelId', channel._id))
          .collect();
        await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));

        // finally delete the channel itself
        await ctx.db.delete(channel._id);
      })
    );
  },
});