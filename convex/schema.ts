import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  agent: defineTable({
    name: v.string(),
    description: v.string(),
    system: v.string(),
    llmConfig: v.object({
      model: v.string(),
      provider: v.string(),
      temperature: v.number(),
    }),
    tools: v.array(v.any()),
    metadata: v.any(),
    version: v.string(),
  }),

  documents: defineTable({
    title: v.string(),
    emoji: v.string(),
    userId: v.string(),
    canvas: v.object({
      edges: v.array(v.any()),
      nodes: v.array(v.any()),
    })
  }).index('by_user', ['userId']),
  
  channels: defineTable({
    name: v.string(),
    type: v.union(v.literal('public'), v.literal('private'), v.literal('direct')),
    description: v.optional(v.string()),
    organizationId: v.string(),
  })
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_organization', ['organizationId']),
  

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
    reactions: v.array(v.object({
      emoji: v.string(),
      userId: v.string(),
    }))
  })
  .index('by_channel', ['channelId'])
  .index('by_channel_createdAt', ['channelId', 'createdAt']),

  users: defineTable({
    name: v.string(),
    externalId: v.string(),
    imageUrl: v.string(),
  }).index("byExternalId", ["externalId"]),

});