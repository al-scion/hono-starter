import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('public'), v.literal('private'), v.literal('direct')),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const { name, description, type, organizationId } = args
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new Error('Unauthorized')

    const channelId = await ctx.db.insert('channels', {
      name,
      description,
      type,
      organizationId,
    })
    await ctx.db.insert('channelMembers', {
      channelId,
      userId: user.subject,
      role: 'admin',
    })
    return channelId
  },
})

export const getChannels = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query('channels')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect()
  },
})

export const joinChannel = mutation({
  args: {
    channelId: v.id('channels'),
  },
  handler: async (ctx, { channelId }) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new Error('Unauthorized')

    // Check if already a member
    const existing = await ctx.db
      .query('channelMembers')
      .withIndex('by_channel', (q) => q.eq('channelId', channelId))
      .filter((q) => q.eq(q.field('userId'), user.subject))
      .first()

    if (existing) return { success: true }

    await ctx.db.insert('channelMembers', {
      channelId,
      userId: user.subject,
      role: 'member',
    })

    return { success: true }
  },
})