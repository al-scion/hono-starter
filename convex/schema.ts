import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const author = v.union(
  v.object({type: v.literal('user'), id: v.string()}),
  v.object({type: v.literal('agent'), id: v.id('agents')}),
);

export default defineSchema({

  agents: defineTable({
    name: v.string(),
    userId: v.string(),
    description: v.string(),
    system: v.string(),
    model: v.string(),
    temperature: v.number(),
    tools: v.array(v.any()),
    variables: v.record(v.string(), v.string()),
    metadata: v.any(),
    version: v.number(),
    emoji: v.optional(v.string()),
    canvas: v.object({
      edges: v.array(v.any()),
      nodes: v.array(v.any()),
    }),
  })
  .index('by_user', ['userId'])
  .index('by_name', ['name']),

  channels: defineTable({
    name: v.string(),
    type: v.union(v.literal('public'), v.literal('private'), v.literal('direct')),
    description: v.optional(v.string()),
    organizationId: v.string(),
  })
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_organization', ['organizationId']),
  
  messages: defineTable({
    channelId: v.id('channels'),
    author: author,
    text: v.string(),
    // status: v.optional(v.union(v.literal('pending'), v.literal('streaming'), v.literal('completed'))),

    // Thread related fields 
    threadId: v.optional(v.id('messages')),
    path: v.optional(v.string()), // A materialized path of the message in the thread

    // Stream related fields
    streamingId: v.optional(v.string()),
    streamingText: v.optional(v.string()),
    streamingStatus: v.optional(v.union(v.literal('streaming'), v.literal('completed'))),

    // Other fields
    files: v.optional(v.array(v.id('_storage'))),

  })
  .index('by_channel', ['channelId'])
  .index('by_thread', ['threadId']),

  files: defineTable({
    storageId: v.id('_storage'),
    name: v.string(),
  })
  .index('by_storage', ['storageId'])
  .index('by_name', ['name']),


  messageReactions: defineTable({
    messageId: v.id('messages'),
    emoji: v.string(),
    author: author,
  })
  .index('by_message', ['messageId'])
  .index('by_author', ['author.id'])
  .index('by_author_message_emoji', ['author.id', 'messageId', 'emoji']),

  channelMembers: defineTable({
    channelId: v.id('channels'),
    memberId: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
    type: v.optional(v.any()),
  })
  .index('by_channel', ['channelId'])
  .index('by_member', ['memberId']),

  typingStates: defineTable({
    userId: v.string(),
    fieldId: v.string(),
    lastUpdated: v.number()
  })
  .index('by_user_field', ['userId', 'fieldId'])
  .index('by_field', ['fieldId'])
  .index('by_user', ['userId']),

});
