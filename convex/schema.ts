import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  documents: defineTable({
    title: v.string(),
    emoji: v.optional(v.string()),
    userId: v.string(),
    canvas: v.object({
      edges: v.array(v.any()),
      nodes: v.array(v.any()),
    })
  }).index('by_user', ['userId']),
  
});