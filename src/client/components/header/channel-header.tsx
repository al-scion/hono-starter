import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { Id } from "@/lib/api";
import { useParams } from "@tanstack/react-router";
import { useChannels } from "@/hooks/use-convex";
import { Ellipsis, Hash } from "lucide-react";

export function ChannelHeader({
  className,
  ...props
}: React.ComponentProps<'header'>) {

  const { channelId } = useParams({from: '/_authenticated/_layout/channel/$channelId'}) as { channelId: Id<'channels'> }; 
  const { data: channels } = useChannels();
  const channel = channels?.find((channel) => channel._id === channelId);


  if (!channel) return null;
  return (
    <header
      className={cn(
        'flex h-10 w-full flex-row items-center border-b p-2',
        className
      )}
      {...props}
    >
      <Breadcrumb>
        <BreadcrumbList className="-space-x-1.5">
          <BreadcrumbItem>
            <Button className="h-7 gap-1 px-2 text-foreground [&>svg]:text-foreground" variant="ghost">
              <Hash className="size-4" />
              {channel.name || 'New channel'}
            </Button>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-row items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon">
          <Ellipsis className="size-4" />
        </Button>
      </div>
    </header>
  );
}