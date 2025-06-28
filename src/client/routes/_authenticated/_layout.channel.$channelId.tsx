import { createFileRoute, useParams } from '@tanstack/react-router'
import { Id } from '@/lib/api'
import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useMessages, useSendMessage } from '@/hooks/use-convex'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_authenticated/_layout/channel/$channelId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { channelId } = useParams({ from: '/_authenticated/_layout/channel/$channelId' }) as { channelId: Id<'channels'> }

  // Use custom hooks instead of inline React Query
  const { data: messages } = useMessages(channelId)
  const { mutate: sendMessage } = useSendMessage()

  const [text, setText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const MessageRow = ({ msg }: { msg: any }) => {
    const user = msg.user ?? null;
    const initials = (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')
    return (
      <div className='flex gap-3 items-start'>
        <Avatar className='size-8'>
          {user?.imageUrl && <AvatarImage src={user.imageUrl} />}
          <AvatarFallback className='text-xs'>
            {initials || '?'}
          </AvatarFallback> 
        </Avatar>
        <div className='flex flex-col'>
          <div className='flex flex-row items-center gap-2'>
            <span className='font-medium'>
              {user?.firstName ?? user?.lastName ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : msg.userId.slice(0,6)}
            </span>
            <span className='text-xs text-muted-foreground'>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>
          <span>{msg.text}</span>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage({ channelId, text })
    setText('')
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto p-4 space-y-2'>
        {messages?.map((msg) => (
          <MessageRow key={msg._id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
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
