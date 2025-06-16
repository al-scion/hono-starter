import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { prosemirrorSync } from "./prosemirror";

export const getDocument = query({
  args: {
    docId: v.id('documents'),
  },
  
  handler: async (ctx, args) => {
    const { docId } = args
    return await ctx.db.get(docId)
  },
})

export const getDocuments = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new Error('Unauthorized')

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_user', (q) => q.eq('userId', user.subject))
      .collect()
    return documents
  },
})

export const createDocument = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new Error('Unauthorized')

    const documentId = await ctx.db.insert('documents', {
      title: '',
      userId: user.subject,
      canvas: {
        edges: [],
        nodes: [],
      },
    })

    prosemirrorSync.create(ctx, documentId, {type: 'doc', content: [{type: 'text', text: ''}]})
    return { 
      success: true,
      documentId,
    }
  },
});

export const updateTitle = mutation({
  args: {
    docId: v.id('documents'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { docId, title } = args
    await ctx.db.patch(docId, { title })
  },
})

export const deleteDocument = mutation({
  args: {
    docId: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const { docId } = args
    await ctx.db.delete(docId)
  },
})