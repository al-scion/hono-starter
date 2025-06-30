import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/dashboard')({
  component: Dashboard,
})

export default function Dashboard() {

  return (
    <div className="text-xs break-words">
    </div>
  )
}

