import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { Canvas } from '@/components/canvas/canvas'
import { Document } from '@/components/tiptap/document'
import { convexApi, Id } from '@/lib/api'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useConvexMutation, convexQuery } from '@convex-dev/react-query'
import { useTiptapSync } from '@convex-dev/prosemirror-sync/tiptap'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

export const Route = createFileRoute('/app/_layout/document/$docId')({
  component: RouteComponent,
  validateSearch: z.object({
    mode: z.enum(['editor', 'canvas', 'hybrid']),
  })
})

function RouteComponent() {

  const { mode } = useSearch({ from: '/app/_layout/document/$docId' })
  const { docId } = useParams({ from: '/app/_layout/document/$docId' }) as { docId: Id<'documents'> }
  const sync = useTiptapSync(convexApi.prosemirror, docId)
  const document = useQuery(convexQuery(convexApi.document.getDocument, { docId }))
  const [splitRatio, setSplitRatio] = useState(0.5)

  const { mutate: mutateTitle } = useMutation({
    mutationFn: useConvexMutation(convexApi.document.updateTitle).withOptimisticUpdate(
      (localStore, args) => {
        const { docId, title } = args
        const existingDocs = localStore.getQuery(convexApi.document.getDocuments, {})
        const currentDocument = localStore.getQuery(convexApi.document.getDocument, { docId })
        if (existingDocs !== undefined) {
          const updatedDocs = existingDocs.map((doc) => doc._id === docId ? { ...doc, title } : doc)
          localStore.setQuery(convexApi.document.getDocuments, {}, updatedDocs)
        }
        if (currentDocument) {
          localStore.setQuery(convexApi.document.getDocument, { docId }, {
            ...currentDocument,
            title
          })
        }
      }
    ),
  })

  const updateTitle = (title: string) => mutateTitle({ docId, title })

  
  if (sync.isLoading || document.isLoading) return (
    <div className='flex flex-col flex-1 mx-auto w-full max-w-4xl px-8 pt-12 pb-4 h-[calc(100dvh-66px)] overflow-y-auto space-y-4'>
      <Skeleton className='w-full h-12' />
      <Skeleton className='w-full h-18' />
      <Skeleton className='w-full h-40' />
    </div>
  )
  if (!document.data) return <div>Document not found</div>
  

  return (
    <div className='flex flex-1'>
      {(mode === 'editor' || mode === 'hybrid') && <Document sync={sync} document={document.data} updateTitle={updateTitle} />}
      {mode === 'hybrid' && <Separator orientation='vertical' className='h-full' />}
      {(mode === 'canvas' || mode === 'hybrid') && <Canvas document={document.data} />}
    </div>
  )
}
