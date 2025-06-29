import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    email: v.string(),
  }),

  documents: defineTable({
    title: v.string(),
    emoji: v.optional(v.string()),
    userId: v.string(),
    canvas: v.object({
      edges: v.array(v.any()),
      nodes: v.array(v.any()),
    })
  }).index('by_user', ['userId']),
  
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('public'), v.literal('private'), v.literal('direct')),
  })
  .index('by_name', ['name'])
  .index('by_type', ['type']),

  channelMembers: defineTable({
    channelId: v.id('channels'),
    userId: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
  })
  .index('by_channel', ['channelId']),

  // Messages sent within a channel
  messages: defineTable({
    channelId: v.id('channels'),
    userId: v.string(),
    text: v.string(),
    createdAt: v.number(),
  })
  .index('by_channel', ['channelId'])
  .index('by_channel_createdAt', ['channelId', 'createdAt']),

});