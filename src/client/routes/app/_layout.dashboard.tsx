import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '@clerk/clerk-react'

export const Route = createFileRoute('/app/_layout/dashboard')({
  component: Dashboard,
})

export default function Dashboard() {
  const { session } = useSession()

  return (
    <div className="">
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}

