import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/lib/api'

export const Route = createFileRoute('/auth/callback')({
  component: RouteComponent,
  beforeLoad(ctx) {
    const state = new URLSearchParams(ctx.search).get('state')
    const code = new URLSearchParams(ctx.search).get('code')
    if (!state || !code) {
      throw new Error('Invalid state or code')
    }
    api.mcp.auth.callback.$get({query: {state, code}})
  },
})

function RouteComponent() {

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
