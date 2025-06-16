import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_layout/dashboard')({
  component: Dashboard,
})

export default function Dashboard() {

  return (
    <div className="">
    </div>
  )
}

