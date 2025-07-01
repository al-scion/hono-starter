import { createFileRoute, useParams } from '@tanstack/react-router'
import { Id } from '@/lib/api'
import React, { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAddReaction, useMessages, useRemoveReaction, useSendMessage } from '@/hooks/use-convex'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquareText, MoreHorizontal, PenSquare, SmilePlus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useOrganization, useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/_authenticated/_layout/channel/$channelId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' }) as { channelId: Id<'channels'> }
  const org = useOrganization({memberships: {infinite: true}})
  const user = useUser()

  // Use custom hooks instead of inline React Query
  const { data: messages } = useMessages(channelId)
  const { mutate: sendMessage } = useSendMessage()
  const { mutate: addReaction } = useAddReaction(channelId)
  const { mutate: removeReaction } = useRemoveReaction(channelId)

  const handleReaction = (messageId: Id<'messages'>, emoji: string) => {
    const existingReaction = messages?.find(m => m._id === messageId)?.reactions.find(r => r.emoji === emoji && r.userId === user.user?.id)
    if (existingReaction) {
      removeReaction({ messageId, emoji })
    } else {
      addReaction({ messageId, emoji })
    }
  }

  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage({ channelId, text })
    setText('')
  }

  return (
    <div className='flex flex-col flex-1 h-full'>
      <div className='flex-1 overflow-y-auto py-4 min-w-0 break-words'>
        <div className='space-y-2'>
          {messages?.map((msg) => {
            const user = org.memberships?.data?.find((m) => m.publicUserData?.userId === msg.userId)
            const reactionSet: Record<string, number> = msg.reactions.reduce((acc, reaction) => {
              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
              return acc
            }, {} as Record<string, number>)
            return (
              <div 
                key={msg._id}
                className={cn(
                  'group/message flex flex-row gap-2 items-start px-4 py-1 relative',
                  'hover:bg-muted has-[[data-state=open]]:bg-muted',
                )}
              >
                <Avatar className='size-6 mt-1'>
                  <AvatarImage src={user?.publicUserData?.imageUrl ?? undefined} />
                  <AvatarFallback>{user?.publicUserData?.firstName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col min-w-0 flex-1'>
                  <div className='flex flex-row items-center gap-2'>
                    <span className='font-medium'>{user?.publicUserData?.firstName} {user?.publicUserData?.lastName}</span>
                    <span className='text-xs text-muted-foreground'>{new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <span className='break-words'>{msg.text}</span>
                  <div className='flex flex-row gap-1 my-1'>
                    {Object.entries(reactionSet).map(([emoji, count]) => (
                      <Button 
                        key={emoji} 
                        variant='outline'
                        onClick={() => handleReaction(msg._id, emoji)} 
                        className='rounded-full h-6 px-2 shadow-none'
                      >
                        {emoji} {count}
                      </Button>
                    ))}
                  </div>
                </div>
                <div 
                  className={cn(
                    'absolute top-0 right-2 -translate-y-1/2',
                    'flex flex-row gap-0.5 p-0.5 rounded-md shadow border bg-background',
                    'opacity-0 group-hover/message:opacity-100 group-has-data-[state=open]/message:opacity-100',
                  )}
                >
                  <Button variant='ghost' size='icon' onClick={() => handleReaction(msg._id, '✅')}>
                    ✅
                  </Button>
                  <Button variant='ghost' size='icon' onClick={() => handleReaction(msg._id, '🙌')}>
                    🙌
                  </Button>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
                    <SmilePlus className='size-4' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
                    <MessageSquareText className='size-4' />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-6 w-6'>
                        <MoreHorizontal className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className="group/message-actions">
                      <DropdownMenuItem>
                        <PenSquare className='size-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className='size-4' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )})}
        </div>
      </div>
      <form onSubmit={handleSubmit} className='flex p-2 border-t gap-2'>
        <Input
          className='flex-1'
          placeholder='Type a message…'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type='submit'>
          Send
        </Button>
      </form>
    </div>
  )
}
