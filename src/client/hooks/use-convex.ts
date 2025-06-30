import { useQuery, useMutation } from '@tanstack/react-query'
import { useConvexMutation, convexQuery } from '@convex-dev/react-query'
import { convexApi, Id } from '@/lib/api'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { useRouter } from '@tanstack/react-router'

// Channels hooks
export function useChannels() {
  const { organization } = useOrganization()
  if (!organization) return { data: undefined }
  return useQuery(
    convexQuery(convexApi.channel.getChannels, { organizationId: organization.id })
  )
}

export function useCreateChannel() {
  const router = useRouter()
  return useMutation({
    mutationFn: useConvexMutation(convexApi.channel.createChannel),
    onSuccess: (data: Id<'channels'>) => {
      router.navigate({ to: '/channel/$channelId', params: { channelId: data } })
    }
  })
}

// Messages hooks
export function useMessages(channelId: Id<'channels'>) {
  return useQuery(convexQuery(convexApi.message.listMessages, { channelId }))
}

export function useSendMessage() {
  const { user } = useUser()
  if (!user) throw new Error('User not authenticated')
  return useMutation({
    mutationFn: useConvexMutation(convexApi.message.sendMessage).withOptimisticUpdate(
      (localStore, args) => {
        const { channelId, text } = args
        const existingMessages = localStore.getQuery(convexApi.message.listMessages, { channelId })
        
        if (existingMessages !== undefined) {
          const optimisticMessage = {
            _id: `temp-${Date.now()}` as Id<'messages'>,
            _creationTime: Date.now(),
            channelId,
            userId: user.id,
            text,
            reactions: [],
            createdAt: Date.now(),
          }
          
          localStore.setQuery(convexApi.message.listMessages, { channelId }, [
            ...existingMessages,
            optimisticMessage,
          ])
        }
      }
    ),
  })
}

export function useAddReaction(channelId: Id<'channels'>) {
  const { user } = useUser()
  return useMutation({
    mutationFn: useConvexMutation(convexApi.message.addReaction).withOptimisticUpdate(
      (localStore, args) => {
        const { messageId, emoji } = args
        const existingMessages = localStore.getQuery(convexApi.message.listMessages, { channelId })
        if (!existingMessages) return
        const updatedMessages = existingMessages.map(message => 
          message._id === messageId ? {
            ...message,
            reactions: [...message.reactions, { emoji, userId: user?.id ?? '' }]
          } : message
        )
        localStore.setQuery(convexApi.message.listMessages, { channelId }, updatedMessages)
      }
    )
  })
}

export function useRemoveReaction(channelId: Id<'channels'>) {
  const { user } = useUser()
  return useMutation({
    mutationFn: useConvexMutation(convexApi.message.removeReaction).withOptimisticUpdate(
      (localStore, args) => {
        const { messageId, emoji } = args
        const existingMessages = localStore.getQuery(convexApi.message.listMessages, { channelId })
        if (!existingMessages) return
        const updatedMessages = existingMessages.map(message => 
          message._id === messageId ? {
            ...message,
            reactions: message.reactions.filter(r => !(r.emoji === emoji && r.userId === user?.id))
          } : message
        )
        localStore.setQuery(convexApi.message.listMessages, { channelId }, updatedMessages)
      }
    )
  })
}

// Documents hooks
export function useDocuments() {
  return useQuery(convexQuery(convexApi.document.getDocuments, {}))
}

export function useDocument(docId: Id<'documents'>) {
  return useQuery(convexQuery(convexApi.document.getDocument, { docId }))
}

export function useMutateEmoji() {
  return useMutation({
    mutationFn: useConvexMutation(convexApi.document.updateEmoji).withOptimisticUpdate(
      (localStore, args) => {
        const { docId, emoji } = args
        const existingDocs = localStore.getQuery(convexApi.document.getDocuments, {})
        const currentDocument = localStore.getQuery(convexApi.document.getDocument, { docId })
        if (existingDocs !== undefined) {
          const updatedDocs = existingDocs.map((doc) => doc._id === docId ? { ...doc, emoji } : doc)
          localStore.setQuery(convexApi.document.getDocuments, {}, updatedDocs)
        }
        if (currentDocument) {
          localStore.setQuery(convexApi.document.getDocument, { docId }, {
            ...currentDocument,
            emoji
          })
        }
      }
    ),
  })
}

export function useMutateTitle() {
  return useMutation({
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
}

export function useCreateDocument() {
  const router = useRouter()
  return useMutation({
    mutationFn: useConvexMutation(convexApi.document.createDocument).withOptimisticUpdate(
      (localStore, args) => {
        const { } = args
        const existingDocuments = localStore.getQuery(convexApi.document.getDocuments, {})
        if (existingDocuments !== undefined) {
          const optimisticDocument = {
            _id: `temp-${Date.now()}` as Id<'documents'>,
            _creationTime: Date.now(),
            title: '',
            userId: '',
            emoji: '📄',
            canvas: { edges: [], nodes: [] },
          }
          localStore.setQuery(convexApi.document.getDocuments, {}, [
            ...existingDocuments,
            optimisticDocument,
          ])
        }
      }
    ),
    onSuccess: (data) => {
      router.navigate({ to: '/document/$docId', params: { docId: data.documentId }, search: { mode: 'editor' } })
    }
  })
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: useConvexMutation(convexApi.document.deleteDocument).withOptimisticUpdate(
      (localStore, args) => {
        const { docId } = args
        const existingDocuments = localStore.getQuery(convexApi.document.getDocuments, {})
        if (existingDocuments !== undefined) {
          const updatedDocuments = existingDocuments.filter((doc) => doc._id !== docId)
          localStore.setQuery(convexApi.document.getDocuments, {}, updatedDocuments)
        }
      }
    ),
  })
}
