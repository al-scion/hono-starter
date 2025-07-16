import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PenSquare, SmilePlus, Trash2, ChevronRight, MessageCircleMore, User, Table, Download } from "lucide-react";
import type { Doc, Id } from "@/lib/api";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { useMemo } from "react";
import { TooltipButton } from "@/components/custom/tooltip-button";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Spinner } from "@/components/custom/spinner";

import { 
  useAddReaction, 
  useAgent, 
  useReactions, 
  useRemoveReaction, 
  useThreadMessages,
  useMultipleFileMetadata,
} from "@/hooks/use-convex";

import { useChat, type UIMessage } from "@ai-sdk/react";
import type { UserMessageMetadata } from "@/lib/types";
import prettyBytes from "pretty-bytes";
import { prettyFileType } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function ChatMessage({
  msg,
  chat,
  isThread,
  shouldGroup
}: {
  msg: Doc<'messages'>;
  chat: ReturnType<typeof useChat<UIMessage<UserMessageMetadata>>>;
  isThread?: boolean;
  shouldGroup?: boolean;
}) {

  const { memberships } = useOrganization({ memberships: { infinite: true } });
  const { user } = useUser();
  const navigate = useNavigate();
  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' });
  const search = useSearch({ from: '/_authenticated/_layout/channel/$channelId' });

  const { mutate: addReaction } = useAddReaction();
  const { mutate: removeReaction } = useRemoveReaction();
  const { data: reactions } = useReactions(msg._id);

  const { data: agentData } = useAgent(msg.author.id as Id<'agents'>);
  const userData = memberships?.data?.find((m) => m.publicUserData?.userId === msg.author.id)?.publicUserData;
  const filesMetadata = useMultipleFileMetadata(msg.files ?? []);


  const { data: threadMessages } = useThreadMessages(msg._id);
  const streamingMessage = chat.messages.find(m => m.id === msg.streamingId);

  const messageToShow = useMemo(() => {
    if (msg.streamingStatus === 'streaming' && streamingMessage) {
      return streamingMessage.parts.filter(p => p.type === 'text').map(p => p.text).join('');
    }

    if (msg.streamingStatus === 'streaming' && !streamingMessage) {
      return msg.streamingText;
    }

    if (msg.streamingStatus === 'completed' && streamingMessage) {
      chat.setMessages([])
    }

    return msg.text;
  },[streamingMessage, msg])
  

  const authorImage = () => {
    switch (msg.author.type) {
      case 'user': 
        return userData?.imageUrl;
      case 'agent':
        return undefined
    }
  }

  const authorName = () => {
    switch (msg.author.type) {
      case 'user':
        return `${userData?.firstName} ${userData?.lastName}`;
      case 'agent':
        return agentData?.name || 'New agent';
    }
  }
  
  const handleShowThread = () => {
    navigate({
      to: '/channel/$channelId',
      params: { channelId },
      search: { ...search, thread: msg._id }
    });
  }

  const handleReaction = (messageId: Id<'messages'>, emoji: string) => {
    const existingReaction = reactions?.find((r) => r.emoji === emoji && r.author.id === user?.id);
    if (existingReaction) {
      removeReaction({ messageId, emoji });
    } else {
      addReaction({ messageId, emoji });
    }
  };

  const reactionSet: Record<string, {count: number, authors: Doc<'messageReactions'>['author'][], userReacted: boolean}> = useMemo(() => {
    if (!reactions) return {};
    return reactions.reduce((acc, r) => {
      if (acc[r.emoji]) {
        acc[r.emoji].count++;
        acc[r.emoji].authors.push(r.author);
        acc[r.emoji].userReacted = r.author.id === user?.id;
      } else {
        acc[r.emoji] = {
          count: 1,
          authors: [r.author],
          userReacted: r.author.id === user?.id
        };
      }
      return acc;
    }, {} as Record<string, {count: number, authors: Doc<'messageReactions'>['author'][], userReacted: boolean}>);
  }, [reactions]);

  return (
    <div
      className={cn(
        'group/message relative flex flex-row items-start gap-2 px-4 py-1',
        'hover:bg-muted has-[[data-state=open]]:bg-muted'
      )}
      key={msg._id}
    >
      
      {shouldGroup && <span className="text-muted-foreground text-xs w-9 h-6 items-center flex justify-center opacity-0 group-hover/message:opacity-100">
        {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>}
      <Avatar className={cn("mt-1 size-9 rounded-sm", shouldGroup && "hidden")}>
        <AvatarImage src={authorImage()}/>
        <AvatarFallback className="bg-muted rounded-sm"><User className="size-4" /></AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col">
        <div className={cn("flex flex-row items-center gap-2", shouldGroup && "hidden")}>
          <span className="font-medium">
            {authorName()}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(msg._creationTime).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', hour12: true})}
          </span>
        </div>
        <span>{messageToShow ? messageToShow : <Spinner variant='ellipsis' />}</span>
        <div className="flex flex-col gap-1">
        {msg.files && msg.files.length > 0 && <div className="flex flex-row gap-1 mt-1">
          {msg.files.map(f => {
            const item = filesMetadata.find(m => m?.data?._id === f)?.data;
            return (
              <div className="flex flex-row items-center p-1 gap-1 bg-background relative rounded-md border group/file-item overflow-hidden select-none max-w-64">
                <Table className='rounded p-2 size-8 flex items-center justify-center bg-muted shrink-0' />
                <div className='flex flex-col flex-1 min-w-0'>
                  <p className="text-xs font-medium truncate">{item?.name}</p>
                  <p className="text-xs text-muted-foreground">{prettyFileType(item?.contentType ?? '')} • {prettyBytes(item?.size ?? 0)}</p>
                </div>
                <div className="absolute right-0 opacity-0 group-hover/file-item:opacity-100 bg-background flex flex-row items-center h-full w-1/2 mask-l-from-7">
                  <TooltipButton size="icon" variant="ghost" tooltip="Download" className="hover:bg-transparent ml-auto mr-1">
                    <Download className="size-4" />
                  </TooltipButton>
                </div>
              </div>
          )})}
        </div>}
        {Object.keys(reactionSet).length > 0 && <div className="flex flex-row gap-1">
          {Object.entries(reactionSet).map(([emoji, data]) => (
            <Button
              className={cn("h-6 rounded-md px-1.5 shadow-none gap-1.5 leading-none", data.userReacted && "border-blue-800/70 bg-blue-800/10 text-blue-800")}
              key={emoji}
              onClick={() => handleReaction(msg._id, emoji)}
              variant="outline"
            >
              <p className="text-sm">{emoji}</p>
              <p className="text-xs">{data.count}</p>
            </Button>
          ))}
          <TooltipButton size="icon" variant="ghost" tooltip="Add reaction" className="bg-muted w-7 rounded-md hover:border">
            <SmilePlus className="size-4" />
          </TooltipButton>
        </div>}
          {!isThread && threadMessages && threadMessages.length > 0 && <div className={cn(
            "flex flex-row items-center p-1 -ml-1 gap-2 rounded-md max-w-[75%]",
            "hover:bg-background border border-transparent hover:border-border",
            "group/thread-item cursor-pointer",
          )}
          onClick={handleShowThread}
          >
            <span className="text-sm text-blue-800 group-hover/thread-item:underline">{threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}</span>
            <span className="text-xs text-muted-foreground group-hover/thread-item:hidden">{formatDistanceToNow(new Date(threadMessages[threadMessages.length - 1]._creationTime), { addSuffix: true, includeSeconds: false })}</span>
            <span className="text-xs text-muted-foreground hidden group-hover/thread-item:flex">view thread</span>
            <ChevronRight className="size-3.5 ml-auto text-muted-foreground hidden group-hover/thread-item:block" />
          </div>}
        </div>
      </div>
      <div className={cn(
        'absolute top-0 -translate-y-1/2 right-2',
        'flex flex-row gap-0.5 rounded-lg border bg-background p-1 shadow',
        'opacity-0 group-hover/message:opacity-100 group-has-data-[state=open]/message:opacity-100'
      )}>
        <TooltipButton
          onClick={() => handleReaction(msg._id, '✅')}
          size="icon"
          variant="ghost"
        >
          ✅
        </TooltipButton>
        <TooltipButton
          onClick={() => handleReaction(msg._id, '🙌')}
          size="icon"
          variant="ghost"
        >
          🙌
        </TooltipButton>
        <TooltipButton className="h-6 w-6" size="icon" variant="ghost" tooltip="Add reaction">
          <SmilePlus className="size-4" />
        </TooltipButton>
        <TooltipButton className={cn("h-6 w-6", isThread && "hidden")} size="icon" variant="ghost" tooltip="Reply in thread" onClick={handleShowThread}>
          <MessageCircleMore className="size-4" />
        </TooltipButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipButton className="h-6 w-6" size="icon" variant="ghost" tooltip="More actions">
              <MoreHorizontal className="size-4" />
            </TooltipButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="group/message-actions"
          >
            <DropdownMenuItem>
              <PenSquare className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}