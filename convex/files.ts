import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});


export const createFileRecord = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", { storageId: args.storageId, name: args.name });
  },
})

export const getFileMetadata = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const metadata = await ctx.db.system.get(args.storageId);
    const fileRecord = await ctx.db
      .query('files')
      .withIndex('by_storage', (q) => q.eq('storageId', args.storageId))
      .first();
    
    const sanitizedFileRecord = fileRecord 
      ? (({ _id, _creationTime, ...rest }) => rest)(fileRecord) 
      : null;

    return {
      ...metadata,
      ...sanitizedFileRecord,
    };
  },
});