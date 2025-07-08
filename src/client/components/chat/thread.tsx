import { useParams, useSearch } from '@tanstack/react-router';
import { useChannels, useMessages, useThreadMessages } from '@/hooks/use-convex';
import { ChatInput } from '@/components/chat/input';
import { ChatMessage } from '@/components/chat/message';
import { Button } from '@/components/ui/button';
import { Ellipsis, Hash, ListTree, Lock, X } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export function Thread() {

  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' });
  const { thread, threadParent } = useSearch({ from: '/_authenticated/_layout/channel/$channelId' });
  const { data: channels } = useChannels();
  const channel = channels?.find((channel) => channel._id === channelId);
  const { data: messages } = useMessages(channelId);
  const parentMessage = messages?.find((msg) => msg._id === threadParent);
  const { data: threadMessages } = thread ? useThreadMessages(thread) : { data: [] };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="p-2 h-10 flex flex-row items-center gap-2 border-b">
        <Breadcrumb>
          <BreadcrumbList className="-space-x-1.5">
            <BreadcrumbItem>
              <Button className="h-7 gap-1 px-2 text-foreground [&>svg]:text-foreground" variant="ghost">
                {channel?.type === 'public' && <Hash className="size-4" />}
                {channel?.type === 'private' && <Lock className="size-4" />}
                {channel?.name || 'New channel'}
              </Button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Button className="h-7 gap-1 px-2 text-foreground [&>svg]:text-foreground" variant="ghost">
                <ListTree className="size-4" />
                Thread
              </Button> 
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-row items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon">
            <Ellipsis className="size-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-auto py-4">
        {parentMessage && <ChatMessage key={parentMessage._id} msg={parentMessage} />}
        <div className="border-b" />
        {threadMessages?.map((msg) => (
          <ChatMessage key={msg._id} msg={msg} />
        ))}
      </div>
      <ChatInput channelId={channelId} />
    </div>
  );
}
