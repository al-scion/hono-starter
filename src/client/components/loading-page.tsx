import { Loader2 } from "lucide-react"

export function LoadingPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <Loader2 className='text-muted-foreground animate-spin' />
    </div>
  )
}