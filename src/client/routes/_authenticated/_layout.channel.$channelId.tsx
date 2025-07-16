import { createFileRoute, useParams } from '@tanstack/react-router';
import { useChannel, useMessages } from '@/hooks/use-convex';
import { ChannelHeader } from '@/components/header/channel-header';
import { ChatInput } from '@/components/chat/input';
import { ChatMessage } from '@/components/chat/message';
import type { Id } from '@/lib/api';
import { UIMessage, useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { UserMessageMetadata } from '@/lib/types';
import { useStickToBottom } from 'use-stick-to-bottom';
import { TooltipButton } from '@/components/custom/tooltip-button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { data: channel } = useChannel(channelId);
  const messagesToDisplay = messages?.filter((msg) => !msg.threadId);
  const { scrollRef, contentRef, scrollToBottom, isAtBottom } = useStickToBottom({});

  const chat = useChat<UIMessage<UserMessageMetadata>>({
    id: channelId,
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_CONVEX_ENDPOINT}/stream`,
    }),
  });

  
  const isLoading = chat.status === 'streaming' || chat.status === 'submitted' || messagesToDisplay?.some(msg => msg.streamingStatus === 'streaming')

  return (
    <div className="flex flex-col flex-1 h-full">
      <ChannelHeader />
      <div className='flex flex-col gap-4'>
        <span className='text-xl font-bold'>{channel?.name}</span>
      </div>


      <div className="flex flex-col flex-1 overflow-auto pb-4 relative" ref={scrollRef}> 
        <div ref={contentRef}>
          {messagesToDisplay?.map((msg, index) => {
            const prevMsg = messagesToDisplay[index - 1];
            const shouldGroup =
              index > 0
              && (msg._creationTime - prevMsg._creationTime) <= 5 * 60 * 1000
              && msg.author.id === prevMsg.author.id
              && !messages?.some(m => m.threadId === prevMsg._id);
            
            
            const firstMessageOfDay =
              index === 0 ||
              new Date(msg._creationTime).toDateString() !==
                new Date(messagesToDisplay[index - 1]._creationTime).toDateString();
            
            return (
              <>
                {firstMessageOfDay && <div className='flex flex-row border-b my-5 relative'>
                    <span className="absolute z-50 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-0.5 bg-background text-sm font-medium">
                      {new Date(msg._creationTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                }
                <ChatMessage key={msg._id} msg={msg} chat={chat} shouldGroup={shouldGroup} />
              </>
            )})}
        </div>
        <TooltipButton 
          variant='outline' 
          size='icon'
          className={cn(
            'sticky bottom-0 ml-auto mr-4 rounded-full transition-all duration-300 ease-out',
            isAtBottom ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          )}
          onClick={() => scrollToBottom()}
        >
          <ChevronDown className="size-4" />
        </TooltipButton>
      </div>
      <ChatInput channelId={channelId} chat={chat} isLoading={isLoading} />
    </div>
  );
}
