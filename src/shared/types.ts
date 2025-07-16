import { z } from 'zod';
import type { Id } from '../../convex/_generated/dataModel';

export const userMessageMetadataSchema = z.object({
  agentId: z.custom<Id<'agents'>>().optional(),
  channelId: z.custom<Id<'channels'>>().optional(),
  threadId: z.custom<Id<'messages'>>().optional(),
});

export type UserMessageMetadata = z.infer<typeof userMessageMetadataSchema>;