import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { useMessages, useThreadMessages } from '@/hooks/use-convex';
import { ChatInput } from '@/components/chat/input';
import { ChatMessage } from '@/components/chat/message';
import { Button } from '@/components/ui/button';
import { Ellipsis, ListTree, X } from 'lucide-react';
import { TooltipButton } from '../custom/tooltip-button';

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UserMessageMetadata } from "@/lib/types";


export function Thread() {

  const navigate = useNavigate();
  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' });
  const { thread } = useSearch({ from: '/_authenticated/_layout/channel/$channelId'});
  const { data: messages } = useMessages(channelId);
  const { data: threadMessages } = useThreadMessages(thread);

  const parentMessage = messages?.find((msg) => msg._id === thread);

    const chat = useChat<UIMessage<UserMessageMetadata>>({
      id: thread,
      transport: new DefaultChatTransport({
        api: `${import.meta.env.VITE_CONVEX_ENDPOINT}/stream`,
      }),
    });

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="p-2 h-10 flex flex-row items-center gap-2 border-b">
        <Button className="h-7 gap-1.5 px-2 text-foreground [&>svg]:text-foreground" variant="ghost">
          <ListTree className="size-4" />
          Thread
        </Button> 
        <div className="flex flex-row items-center gap-1 ml-auto">
          <TooltipButton variant="ghost" size="icon">
            <Ellipsis className="size-4" />
          </TooltipButton>
          <TooltipButton variant="ghost" size="icon" tooltip="Close" onClick={() => {
            navigate({
              to: '/channel/$channelId',
              params: { channelId },
              search: { thread: undefined }
            });
          }}>
            <X className="size-4" />
          </TooltipButton>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-auto py-6">
        {parentMessage && <ChatMessage msg={parentMessage} chat={chat} isThread />}
        {threadMessages && threadMessages.length > 0 && <div className="flex flex-row items-center gap-2 p-4">
          <span className="text-xs text-muted-foreground">{threadMessages?.length} {threadMessages?.length === 1 ? 'reply' : 'replies'}</span>
          <div className="flex-1 border-b" />
        </div>}
        {threadMessages?.map((msg) => (
          <ChatMessage key={msg._id} msg={msg} chat={chat} />
        ))}
      </div>
      <ChatInput channelId={channelId} threadId={thread} chat={chat} />
    </div>
  );
}
