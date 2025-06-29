import { createFileRoute } from '@tanstack/react-router'
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute('/_authenticated/_layout/dashboard')({
  component: Dashboard,
})

export default function Dashboard() {

  // const { mcpState, agent } = useMcpStore()
  const session = authClient.useSession()

  return (
    <div className="text-xs break-words">
      {/* <pre>{JSON.stringify(mcpState, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(agent, null, 2)}</pre> */}
      <pre>{JSON.stringify(session, null, 2)}</pre>s
    </div>
  )
}

