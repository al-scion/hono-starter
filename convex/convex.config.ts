import { defineApp } from 'convex/server';

import presence from '@convex-dev/presence/convex.config';
import resend from '@convex-dev/resend/convex.config';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config';
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";

const app = defineApp();

app.use(presence);
app.use(resend);
app.use(persistentTextStreaming);
app.use(prosemirrorSync);

export default app;
