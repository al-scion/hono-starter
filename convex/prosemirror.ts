import { components } from "./_generated/api";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);
export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  // ...
});

export const createDocument = mutation({
  args: {
    docName: v.string(),
  },
  handler: async (ctx, { docName }) => {
    return await prosemirrorSync.create(ctx, docName, {});
  }
})