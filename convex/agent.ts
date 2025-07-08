import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getAgent = query({
  args: {
    agentId: v.id('agents'),
  },
  handler: async (ctx, args) => {
    const { agentId } = args;
    return await ctx.db.get(agentId);
  },
});

export const getAgents = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {throw new Error('Unauthorized')}

    const agents = await ctx.db
      .query('agents')
      .withIndex('by_user', (q) => q.eq('userId', user.subject))
      .collect();
    return agents;
  },
});

export const createAgent = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {throw new Error('Unauthorized')}

    const agentId = await ctx.db.insert('agents', {
      name: '',
      description: '',
      userId: user.subject,
      system: '',
      model: 'openai/gpt-4.1',
      temperature: 1,
      tools: [],
      variables: {},
      metadata: {},
      version: 1,
      emoji: undefined,
      canvas: {
        edges: [],
        nodes: [],
      },
    });

    return agentId;
  },
});

export const updateSystem = mutation({
  args: {
    agentId: v.id('agents'),
    system: v.string(),
  },
  handler: async (ctx, args) => {
    const { agentId, system } = args;
    await ctx.db.patch(agentId, { system });
  },
});

export const updateModel = mutation({
  args: {
    agentId: v.id('agents'),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const { agentId, model } = args;
    await ctx.db.patch(agentId, { model });
  },
});


export const updateName = mutation({
  args: {
    agentId: v.id('agents'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { agentId, name } = args;
    await ctx.db.patch(agentId, { name });
  },
});

export const updateEmoji = mutation({
  args: {
    agentId: v.id('agents'),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const { agentId, emoji } = args;
    await ctx.db.patch(agentId, { emoji });
  },
});

export const updateCanvas = mutation({
  args: {
    agentId: v.id('agents'),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const { agentId, nodes, edges } = args;
    await ctx.db.patch(agentId, { canvas: { nodes, edges } });
  },
});

export const deleteAgent = mutation({
  args: {
    agentId: v.id('agents'),
  },
  handler: async (ctx, args) => {
    const { agentId } = args;
    const user = await ctx.auth.getUserIdentity();
    if (!user) {throw new Error('Unauthorized')}
    await ctx.db.delete(agentId);
  },
});