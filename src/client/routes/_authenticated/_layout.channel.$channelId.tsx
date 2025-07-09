import { createFileRoute, useParams } from '@tanstack/react-router';
import { useMessages } from '@/hooks/use-convex';
import type { Id } from '@/lib/api';
import { ChannelHeader } from '@/components/header/channel-header';
import { ChatInput } from '@/components/chat/input';
import { ChatMessage } from '@/components/chat/message';

export const Route = createFileRoute(
  '/_authenticated/_layout/channel/$channelId'
)({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      channelId: params.channelId as Id<'channels'>
    })
  },
  validateSearch: (search) => ({
    thread: search.thread as Id<'messages'> | undefined,
  })
});

function RouteComponent() {

  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' });
  const { data: messages } = useMessages(channelId);
  const messagesToDisplay = messages?.filter((msg) => !msg.threadId);

  return (
    <div className="flex flex-col flex-1 h-full">
      <ChannelHeader className="sticky top-0" />
      <div className="flex flex-col flex-1 overflow-auto py-4">
        {messagesToDisplay?.map((msg) => (
          <ChatMessage key={msg._id} msg={msg} />
        ))}
      </div>
      <ChatInput channelId={channelId} />
    </div>
  );
}
