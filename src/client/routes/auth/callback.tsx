import { createFileRoute, useSearch } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useSearch({ from: '/auth/callback' })
  const sendCallback = async () => {
    const data = await api.public['auth-callback'].$get({query: params})
    console.log(await data.json())
    return data
  }
  
  useEffect(() => {
    sendCallback()
  }, [params])


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
