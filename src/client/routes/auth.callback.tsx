import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/callback')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    code: search.code as string,
    state: search.state as string,
  }),
})

function RouteComponent() {
  const { code, state } = useSearch({ from: '/auth/callback' })

  if (code && window.opener) {
    window.opener.postMessage({
      type: 'mcp-auth-callback',
      code,
      state,
    }, window.location.origin)
    window.close()
  }

  return null
}
