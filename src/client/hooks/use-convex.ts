import { useQuery, useMutation } from '@tanstack/react-query'
import { useConvexMutation, convexQuery } from '@convex-dev/react-query'
import { convexApi, Id } from '@/lib/api'
import { useUser } from '@clerk/clerk-react'

// Channels hooks
export function useChannels() {
  return useQuery(convexQuery(convexApi.channel.getChannels, {}))
}

export function useCreateChannel() {
  const { user } = useUser()
  return useMutation({
    mutationFn: useConvexMutation(convexApi.channel.createChannel).withOptimisticUpdate(
      (localStore, args) => {
        const { name, type } = args
        const existingChannels = localStore.getQuery(convexApi.channel.getChannels, {})
        if (existingChannels !== undefined) {
          const optimisticChannel = {
            _id: `temp-${Date.now()}` as Id<'channels'>,
            _creationTime: Date.now(),
            name,
            userId: user?.id ?? '',
            type,
          }
          localStore.setQuery(convexApi.channel.getChannels, {}, [
            ...existingChannels,
            optimisticChannel,
          ])
        }
      }
    )
  })
}

// Messages hooks
export function useMessages(channelId: Id<'channels'>) {
  return useQuery(convexQuery(convexApi.message.listMessages, { channelId }))
}

export function useSendMessage() {
  const { user } = useUser()
  
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
            userId: user?.id ?? '',
            text,
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

// Documents hooks
export function useDocuments() {
  return useQuery(convexQuery(convexApi.document.getDocuments, {}))
}

export function useCreateDocument() {
  const { user } = useUser()
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
            userId: user?.id ?? '',
            canvas: { edges: [], nodes: [] },
          }
          localStore.setQuery(convexApi.document.getDocuments, {}, [
            ...existingDocuments,
            optimisticDocument,
          ])
        }
      }
    )
  })
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: useConvexMutation(convexApi.document.deleteDocument),
  })
}
