import { useParams } from '@tanstack/react-router';
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from '@/components/custom/emoji-picker';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useAgents,
  useMutateEmoji,
  useMutateName,
} from '@/hooks/use-convex';
import { Loader } from 'lucide-react';

export function BreadcrumbComponent() {
  const { data: agents } = useAgents();
  const { mutate: mutateEmoji } = useMutateEmoji();
  const { mutate: mutateName } = useMutateName();
  const params = useParams({ from: '/_authenticated/_layout/agent/$agentId' });
  const agent = agents?.find((doc) => doc._id === params.agentId)!;

  return (
    <Breadcrumb>
      <BreadcrumbList className="-space-x-1.5">
        {/* <BreadcrumbItem>
          <Button className="h-7 gap-1 px-2 text-foreground" variant="ghost">
            Agents
          </Button>
        </BreadcrumbItem>
        <BreadcrumbSeparator /> */}
        <BreadcrumbItem>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="h-7 gap-1 px-2 text-foreground [&>svg]:text-foreground"
                variant="ghost"
              >
                {agent.emoji && <span className="text-base leading-none">{agent.emoji}</span>}
                <Loader className="size-4" />
                <span>{agent.name || 'New agent'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="flex flex-row items-center gap-1.5 p-1.5"
              alignOffset={-6}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <span className="flex size-7 min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md border">
                    {agent.emoji || <Loader className="size-4 text-muted-foreground" />}
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  alignOffset={-7}
                  className="max-h-64 overflow-y-auto p-0"
                  sideOffset={10}
                >
                  <EmojiPicker
                    onEmojiSelect={(emoji) =>
                      mutateEmoji({ agentId: params.agentId, emoji: emoji.emoji })
                    }
                  >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                  </EmojiPicker>
                </PopoverContent>
              </Popover>
              <Input
                className="h-7 px-2 shadow-none"
                onChange={(e) => mutateName({ agentId: params.agentId, name: e.target.value })}
                placeholder="New agent"
                value={agent.name}
              />
            </PopoverContent>
          </Popover>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
