import { createFileRoute } from '@tanstack/react-router'
import { Messages } from '@/components/chat/messages'
import { useStore } from '@/lib/state'

export const Route = createFileRoute('/app/_layout/chat')({
  component: RouteComponent,
})

function RouteComponent() {
    const { chatId } = useStore()
  
  return (
    <div className="h-full p-2">
      <Messages key={chatId} />
    </div>
  )
}
