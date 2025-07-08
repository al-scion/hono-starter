import { useUser } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { Ellipsis, ListFilter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { formatDistanceToNow } from 'date-fns';

export const Route = createFileRoute('/_authenticated/_layout/dashboard')({
  component: Dashboard,
});

const messageItem = [{
  id: '1',
  name: 'John Doe',
  lastMessage: 'Hello, how are you?',
  imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
  unreadCount: 3,
  lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
}]

export default function Dashboard() {
  const { user } = useUser();

  return (
    <ResizablePanelGroup autoSaveId="dashboard-layout" direction="horizontal">
      <ResizablePanel
        className="flex flex-col"
        defaultSize={25}
        maxSize={50}
        minSize={25}
      >
        <div className="flex h-10 flex-row items-center gap-1 border-b p-2">
          <Button className="h-7 bg-muted px-1.5" variant="ghost">
            Recent
          </Button>
          <Button className="h-7 px-1.5 font-normal" variant="ghost">
            Unread
          </Button>
          <div className="ml-auto flex flex-row items-center gap-1">
            <Button size="icon" variant="ghost">
              <Search className="size-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <ListFilter className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-2">
          {messageItem.map((item) => (
          <div key={item.id} className="flex flex-row items-center gap-2 overflow-hidden rounded-lg p-2 hover:bg-muted">
            <img
              alt={item.name || ''}
              className="size-9 rounded-full"
              src={item.imageUrl}
            />
            <div className="flex flex-1 flex-col text-sm">
              <div className="flex flex-row items-center">
                <span className="font-medium">{item.name}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {formatDistanceToNow(item.lastMessageTime, { addSuffix: true })}
                </span>
              </div>
              <div className="flex flex-row items-center">
                <span className="truncate">{item.lastMessage}</span>
                <span className="ml-auto rounded-full bg-green-600 px-1 text-white text-xs">
                  {item.unreadCount}
                </span>
              </div>
            </div>
          </div>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="flex flex-col">
        <div className="flex h-10 flex-row items-center gap-2 border-b p-2">
          <img
            alt={user?.fullName || ''}
            className="ml-1 size-6 rounded-full"
            src={user?.imageUrl}
          />
          <span className="font-medium text-sm">{user?.fullName}</span>
          <div className="ml-auto flex flex-row items-center gap-1">
            <Button size="icon" variant="ghost">
              <Ellipsis className="size-4" />
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
