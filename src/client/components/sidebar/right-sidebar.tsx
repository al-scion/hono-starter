import { Thread } from '@/components/chat/thread';
import { Messages } from '@/components/chat/messages';
import { useSearch, useLocation } from '@tanstack/react-router';
import { useStore } from '@/lib/state';
import { useEffect } from 'react';

export function RightSidebar() {

  const location = useLocation();

  return (
    <div className='flex flex-col flex-1 h-full'>
      {/* {JSON.stringify(location, null, 2)} */}
      {location.search.thread && <Thread />}
    </div>
  )
}