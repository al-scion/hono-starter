export { api as convexApi } from '../../../convex/_generated/api';
export type { Doc, Id } from '../../../convex/_generated/dataModel';

import { hc } from 'hono/client';
import type { AppType } from '../../server';

export const api = hc<AppType>('', { init: { credentials: 'include' } }).api;
