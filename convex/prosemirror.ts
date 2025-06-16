import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const prosemirrorSync = new ProsemirrorSync<Id<"documents">>(
  components.prosemirrorSync
);

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  async checkRead(ctx, id) {
    const document = await ctx.db.get(id)
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new Error("Unauthorized")
    if (document?.userId !== user.subject) throw new Error("Unauthorized")
  },
  async checkWrite(ctx, id) {
    const document = await ctx.db.get(id)
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new Error("Unauthorized")
    if (document?.userId !== user.subject) throw new Error("Unauthorized")
  },
});