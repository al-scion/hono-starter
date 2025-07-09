import { useOrganization, useUser } from '@clerk/clerk-react';
import { convexQuery, useConvexMutation, useConvexAction } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { convexApi, type Id } from '@/lib/api';
// import { useAction } from 'convex/react';

// Channels hooks
export function useChannels() {
  const { organization } = useOrganization();
  if (!organization) {
    return { data: undefined };
  }
  return useQuery(
    convexQuery(convexApi.channel.getChannels, {
      organizationId: organization.id,
    })
  );
}

export function useCreateChannel() {
  const router = useRouter();
  return useMutation({
    mutationFn: useConvexMutation(convexApi.channel.createChannel),
    onSuccess: (data: Id<'channels'>) => {
      router.navigate({
        to: '/channel/$channelId',
        params: { channelId: data },
        search: { thread: undefined },
      });
    },
  });
}

export function useDeleteChannel() {
  const { organization } = useOrganization();
  return useMutation({
    mutationFn: useConvexMutation(convexApi.channel.deleteChannel).withOptimisticUpdate((localStore, args) => {
      const { channelId } = args;
      const existingChannels = localStore.getQuery(convexApi.channel.getChannels, { organizationId: organization?.id ?? '' });
      if (existingChannels !== undefined) {
        const updatedChannels = existingChannels.filter((channel) => channel._id !== channelId);
        localStore.setQuery(convexApi.channel.getChannels, { organizationId: organization?.id ?? '' }, updatedChannels);
      }
    }),
  });
}

// Messages hooks
export function useMessages(channelId: Id<'channels'>) {
  return useQuery(convexQuery(convexApi.message.listMessages, { channelId }));
}

export function useThreadMessages(threadId: Id<'messages'>) {
  return useQuery(convexQuery(convexApi.message.listThreadMessages, { threadId }));
}

export function useReactions(messageId: Id<'messages'>) {
  return useQuery(convexQuery(convexApi.message.listReactions, { messageId }));
}

export function useSendAIMessage() {
  return useConvexAction(convexApi.message.sendAIMessage)
}

export function useSendMessage() {
  const { user } = useUser();

  return useMutation({
    mutationFn: useConvexMutation(convexApi.message.sendMessage).withOptimisticUpdate((localStore, args) => {
      const { channelId, text, threadId } = args;

      const tempId = `temp-${Date.now()}` as Id<'messages'>;
      const existingMessages = localStore.getQuery(convexApi.message.listMessages, { channelId });
      const existingThreadMessages = threadId ? localStore.getQuery(convexApi.message.listThreadMessages, { threadId }) : [];

      if (existingMessages !== undefined) {
        const optimisticMessage = {
          _id: tempId,
          _creationTime: Date.now(),
          channelId,
          text,
          threadId,
          author: { type: 'user' as const, id: user!.id },
          status: 'pending' as const,
        };

        localStore.setQuery(convexApi.message.listReactions, { messageId: tempId }, []);
        localStore.setQuery(convexApi.message.listMessages, { channelId }, [...existingMessages, optimisticMessage]);
        threadId && localStore.setQuery(convexApi.message.listThreadMessages, { threadId }, [...(existingThreadMessages ?? []), optimisticMessage]);
      }
    }),
  });
}

export function useAddReaction() {
  const { user } = useUser();
  
  return useMutation({
    mutationFn: useConvexMutation(
      convexApi.message.addReaction
    ).withOptimisticUpdate((localStore, args) => {
      const { messageId, emoji } = args;
      const existingReactions = localStore.getQuery(convexApi.message.listReactions, { messageId });
      const optimisticReaction = {
        _id: `temp-${Date.now()}` as Id<'messageReactions'>,
        _creationTime: Date.now(),
        messageId,
        emoji,
        author: { type: 'user' as any, id: user!.id },
      }

      localStore.setQuery(convexApi.message.listReactions, { messageId }, [
        ...(existingReactions ?? []),
        optimisticReaction,
      ])
    }),
  });
}

export function useRemoveReaction() {
  const { user } = useUser();
  return useMutation({
    mutationFn: useConvexMutation(
      convexApi.message.removeReaction
    ).withOptimisticUpdate((localStore, args) => {
      const { messageId, emoji } = args;
      const existingReactions = localStore.getQuery(convexApi.message.listReactions, { messageId });
      if (!existingReactions) return;

      localStore.setQuery(convexApi.message.listReactions, { messageId }, 
        existingReactions.filter((r) => !(r.emoji === emoji && r.author.id === user!.id))
      )
    }),
  });
}

// Agent hooks
export function useAgents() {
  return useQuery(convexQuery(convexApi.agent.getAgents, {}));
}

export function useAgent(agentId: Id<'agents'>) {
  const { data: agents } = useAgents();
  return useQuery({
    ...convexQuery(convexApi.agent.getAgent, { agentId }),
    initialData: agents?.find((agent) => agent._id === agentId),
  });
}

export function useMutateSystem() {
  return useMutation({
    mutationFn: useConvexMutation(convexApi.agent.updateSystem),
  });
}

export function useMutateModel() {
  return useMutation({
    mutationFn: useConvexMutation(convexApi.agent.updateModel).withOptimisticUpdate((localStore, args) => {
      const { agentId, model } = args;
      const existingAgents = localStore.getQuery(convexApi.agent.getAgents, {});
      const currentAgent = localStore.getQuery(convexApi.agent.getAgent, { agentId });
      
      if (existingAgents !== undefined) {
        const updatedAgents = existingAgents.map((agent) => agent._id === agentId ? { ...agent, model } : agent);
        localStore.setQuery(convexApi.agent.getAgents, {}, updatedAgents);
      }
      if (currentAgent) {
        localStore.setQuery(convexApi.agent.getAgent, { agentId }, { ...currentAgent, model });
      }
    }),
  });
}

export function useMutateEmoji() {
  return useMutation({
    mutationFn: useConvexMutation(
      convexApi.agent.updateEmoji
    ).withOptimisticUpdate((localStore, args) => {
      const { agentId, emoji } = args;
      const existingAgents = localStore.getQuery(convexApi.agent.getAgents, {});
      const currentAgent = localStore.getQuery(convexApi.agent.getAgent, { agentId });
      
      if (existingAgents !== undefined) {
        const updatedAgents = existingAgents.map((agent) => agent._id === agentId ? { ...agent, emoji } : agent);
        localStore.setQuery(convexApi.agent.getAgents, {}, updatedAgents);
      }
      if (currentAgent) {
        localStore.setQuery(convexApi.agent.getAgent, { agentId }, { ...currentAgent, emoji });
      }
    }),
  });
}

export function useMutateName() {
  return useMutation({
    mutationFn: useConvexMutation(
      convexApi.agent.updateName
    ).withOptimisticUpdate((localStore, args) => {
      const { agentId, name } = args;
      const existingAgents = localStore.getQuery(convexApi.agent.getAgents,{});
      const currentAgent = localStore.getQuery(convexApi.agent.getAgent,{ agentId });

      if (existingAgents !== undefined) {
        const updatedAgents = existingAgents.map((agent) => agent._id === agentId ? { ...agent, name } : agent);
        localStore.setQuery(convexApi.agent.getAgents, {}, updatedAgents);
      }
      if (currentAgent) {
        localStore.setQuery(convexApi.agent.getAgent, { agentId }, { ...currentAgent, name });
      }
    }),
  });
}

export function useCreateAgent() {
  const router = useRouter();
  return useMutation({
    mutationFn: useConvexMutation(convexApi.agent.createAgent).withOptimisticUpdate(
      (localStore, args) => {
      const {} = args;
      const existingAgents = localStore.getQuery(convexApi.agent.getAgents, {});
      if (existingAgents !== undefined) {
        const optimisticAgent = {
          _id: 'temp' as Id<'agents'>,
          _creationTime: Date.now(),
          name: '',
          userId: '',
          description: '',
          emoji: '',
          system: '',
          model: 'openai/gpt-4.1',
          temperature: 1,
          tools: [],
          variables: {},
          metadata: {},
          version: 1,
          canvas: { edges: [], nodes: [] },
        };
        localStore.setQuery(convexApi.agent.getAgents, {}, [
          ...existingAgents,
          optimisticAgent,
        ]);
      }
    }),
    onMutate: () => {
      router.navigate({
        to: '/agent/$agentId',
        params: { agentId: 'temp' as Id<'agents'> },
        search: { mode: 'editor' },
      });
    },
    onSuccess: (data) => {
      router.navigate({
        to: '/agent/$agentId',
        params: { agentId: data },
        search: { mode: 'editor' },
        replace: true,
      });
    },
  });
}

export function useDeleteAgent() {
  return useMutation({
    mutationFn: useConvexMutation(
      convexApi.agent.deleteAgent
    ).withOptimisticUpdate((localStore, args) => {
      const { agentId } = args;
      const existingAgents = localStore.getQuery(convexApi.agent.getAgents, {});

      if (existingAgents !== undefined) {
        const updatedAgents = existingAgents.filter((agent) => agent._id !== agentId);
        localStore.setQuery(convexApi.agent.getAgents, {}, updatedAgents);
      }
    }),
  });
}

export function useDraft(channelId: Id<'channels'>) {
  return useQuery(convexQuery(convexApi.draft.getDrafts, { channelId }));
}

export function useSaveDraft() {
  return useMutation({mutationFn: useConvexMutation(convexApi.draft.saveDraft)}
)}

export function useDeleteDraft() {
  return useMutation({mutationFn: useConvexMutation(convexApi.draft.deleteDraft)}
)}