import { Thread } from '@/components/chat/thread';
import { Messages } from '@/components/chat/messages';
import { useLocation } from '@tanstack/react-router';
import { useStore } from '@/lib/state';
import { useEffect } from 'react';

export function RightSidebar() {

  const location = useLocation();
  const { rightSidebarRef } = useStore();

  useEffect(() => {
    if (location.search.thread) {
      rightSidebarRef?.current?.expand();
    } else {
      rightSidebarRef?.current?.collapse();
    }
  }, [location])

  return (
    <div className='flex flex-col flex-1 h-full'>
      {location.search.thread ? <Thread /> : <Messages />}
    </div>
  )
}