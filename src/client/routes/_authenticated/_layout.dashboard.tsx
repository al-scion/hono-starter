import { createFileRoute } from '@tanstack/react-router'
import { useMcpStore } from '@/components/mcphost'

export const Route = createFileRoute('/_authenticated/_layout/dashboard')({
  component: Dashboard,
})

export default function Dashboard() {

  const { mcpState, agent } = useMcpStore()

  return (
    <div className="text-xs break-words">
      <pre>{JSON.stringify(mcpState, null, 2)}</pre>
      <pre>{JSON.stringify(agent, null, 2)}</pre>
    </div>
  )
}

