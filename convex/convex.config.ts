import { defineApp } from 'convex/server';

import presence from '@convex-dev/presence/convex.config';
import resend from '@convex-dev/resend/convex.config';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config';

const app = defineApp();
app.use(presence);
app.use(resend);
app.use(persistentTextStreaming);

export default app;
