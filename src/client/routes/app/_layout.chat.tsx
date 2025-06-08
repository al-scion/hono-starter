import { createFileRoute } from '@tanstack/react-router'
import { Messages } from '@/components/chat/messages'

export const Route = createFileRoute('/app/_layout/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-full p-2">
      <Messages />
    </div>
  )
}
