import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTypingStats = query({
  args: {
    fieldId: v.string(),
  },
  handler: async (ctx, args) => {
    const { fieldId } = args;
    return await ctx.db.query('typingStates').withIndex('by_field', q => q.eq('fieldId', fieldId)).collect();
  }
})


export const setTypingState = mutation({
  args: {
    userId: v.string(),
    fieldId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('setTypingState', args)

    const existing = await ctx.db.query('typingStates').withIndex('by_user', q => q.eq('userId', args.userId)).first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fieldId: args.fieldId,
        lastUpdated: Date.now(),
      })
    } else {
      await ctx.db.insert('typingStates', {
        userId: args.userId,
        fieldId: args.fieldId,
        lastUpdated: Date.now(),
      })
    }

  }
})

export const removeTypingState = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('typingStates').withIndex('by_user', q => q.eq('userId', args.userId)).first();
    if (existing) {
      ctx.db.patch(existing._id, {
        fieldId: '',
      })
    }

    return {success: true}
  }
})