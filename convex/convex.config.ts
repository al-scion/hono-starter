import { defineApp } from "convex/server";
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(prosemirrorSync);
app.use(persistentTextStreaming);
app.use(agent);

export default app;
