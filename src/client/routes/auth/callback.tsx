import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/lib/api'

export const Route = createFileRoute('/auth/callback')({
  loader: async (opts: any) => {
    const { search } = opts
    const response = await api.public['auth-callback'].$get({ query: search })
    return response.json()
  },
  component: RouteComponent,
})

function RouteComponent() {
  // The loader above already notified the backend.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-8 border shadow-lg p-12 rounded-xl bg-background">
        <span className="text-3xl font-medium">
          Authentication successful
        </span>
        <div className='w-full border-b' />
        <span className="text-md text-muted-foreground">
          You can close this window now
        </span>
      </div>
    </div>
  )
}
