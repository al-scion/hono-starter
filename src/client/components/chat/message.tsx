import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PenSquare, SmilePlus, Trash2, ChevronRight, MessageCircleMore } from "lucide-react";
import type { Doc, Id } from "@/lib/api";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { useAddReaction, useReactions, useRemoveReaction, useThreadMessages } from "@/hooks/use-convex";
import { useMemo } from "react";
import { TooltipButton } from "@/components/custom/tooltip-button";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

export function ChatMessage({
  msg,
  isThread
}: {
  msg: Doc<'messages'>;
  isThread?: boolean;
}) {

  const { memberships } = useOrganization({ memberships: { infinite: true } });
  const { user } = useUser();
  const navigate = useNavigate();
  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' });
  const search = useSearch({ from: '/_authenticated/_layout/channel/$channelId' });

  const { mutate: addReaction } = useAddReaction();
  const { mutate: removeReaction } = useRemoveReaction();
  const { data: reactions } = useReactions(msg._id);

  const { data: threadMessages } = useThreadMessages(msg._id);
  // const threadUser = threadMessages?.map((msg) => msg.author);

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

  const sender = msg.author.type === 'user' ? memberships?.data?.find((m) => m.publicUserData?.userId === msg.author.id) : undefined;


  return (
    <div
      className={cn(
        'group/message relative flex flex-row items-start gap-2 px-4 py-2',
        'hover:bg-muted has-[[data-state=open]]:bg-muted'
      )}
      key={msg._id}
    >
      <Avatar className="mt-1 size-9 rounded-sm">
        <AvatarImage src={sender?.publicUserData?.imageUrl ?? undefined}/>
        <AvatarFallback>
          {sender?.publicUserData?.firstName?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-row items-center gap-2">
          <span className="font-medium">
            {sender?.publicUserData?.firstName} {sender?.publicUserData?.lastName}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(msg._creationTime).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', hour12: true})}
          </span>
        </div>
        <span className="break-words">{msg.text}</span>
        {Object.keys(reactionSet).length > 0 && <div className="flex flex-row gap-1 my-1">
          {Object.entries(reactionSet).map(([emoji, data]) => (
            <Button
              className={cn("h-6 rounded-full px-2 shadow-none gap-1.5 leading-none", data.userReacted && "bg-muted")}
              key={emoji}
              onClick={() => handleReaction(msg._id, emoji)}
              variant="outline"
            >
              <p className="text-sm">{emoji}</p>
              <p className="text-xs">{data.count}</p>
            </Button>
          ))}
        </div>}
        {!isThread && threadMessages && threadMessages.length > 0 && <div className={cn(
          "flex flex-row items-center p-1.5 gap-2 rounded-lg w-[75%]",
          "hover:bg-background border border-transparent hover:border-border",
          "group/thread-item cursor-pointer",
          // msg.threadId && "bg-muted"
        )}
        onClick={handleShowThread}
        >
          <img src={user?.imageUrl} alt="message image" className="size-5 rounded" />
          <span className="text-sm text-blue-800 hover:underline">{threadMessages.length} replies</span>
          <ChevronRight className="size-3.5 ml-auto text-muted-foreground hidden group-hover/thread-item:block" />
        </div>}
      </div>
      <div className={cn(
        '-translate-y-1/2 absolute top-0 right-2',
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