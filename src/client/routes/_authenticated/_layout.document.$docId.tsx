import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { Canvas } from '@/components/canvas/canvas'
import { Document } from '@/components/tiptap/document'
import { convexApi, Id } from '@/lib/api'
import { useTiptapSync } from '@convex-dev/prosemirror-sync/tiptap'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument } from '@/hooks/use-convex'

export const Route = createFileRoute('/_authenticated/_layout/document/$docId')({
  component: RouteComponent,
  validateSearch: z.object({
    mode: z.enum(['editor', 'canvas', 'logs', 'evaluation']),
  })
})

function RouteComponent() {

  const { mode } = useSearch({ from: '/_authenticated/_layout/document/$docId' })
  const { docId } = useParams({ from: '/_authenticated/_layout/document/$docId' }) as { docId: Id<'documents'> }
  const sync = useTiptapSync(convexApi.prosemirror, docId)
  
  const { data: document, isLoading } = useDocument(docId)

  if (sync.isLoading || isLoading) return (
    <div className='flex flex-col flex-1 mx-auto w-full max-w-4xl px-8 pt-12 pb-4 h-[calc(100dvh-66px)] overflow-y-auto space-y-4'>
      <Skeleton className='w-full h-12' />
      <Skeleton className='w-full h-18' />
      <Skeleton className='w-full h-40' />
    </div>
  )
  if (!document) return <div>Document not found</div>

  return (
    <>
      {(mode === 'editor') && <Document sync={sync} document={document} />}
      {(mode === 'canvas') && <Canvas document={document} />}
    </>
  )
}
