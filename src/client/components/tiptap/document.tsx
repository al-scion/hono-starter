import { useRef, useState } from 'react'
import { Doc } from '@/lib/api'
import { useTiptapSync } from '@convex-dev/prosemirror-sync/tiptap'
import { Input } from '@/components/ui/input'
import { DocumentEditor } from '@/components/tiptap/document-editor'
import { Editor as TiptapEditor } from '@tiptap/core'

export function Document({
  sync,
  document,
  updateTitle,
}:{
  sync: ReturnType<typeof useTiptapSync>
  document: Doc<'documents'>
  updateTitle: (title: string) => void
}){
  
  const editorRef = useRef<TiptapEditor>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className='flex flex-col flex-1 mx-auto w-full max-w-3xl px-8 pt-12 pb-4 overflow-y-auto space-y-4'>
        
      <Input
        ref={titleInputRef}
        value={document.title}
        onChange={(e) => updateTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'Tab') {
            e.preventDefault()
            editorRef?.current?.commands.focus()
          }
        }}
        spellCheck={false}
        placeholder="New document"
        className='w-full h-12 p-0 text-3xl font-bold border-none shadow-none focus-visible:ring-0 focus-visible:border-none bg-transparent placeholder:text-muted-foreground/50'
      />
      
      <DocumentEditor 
        sync={sync}
        titleInputRef={titleInputRef}
        editorRef={editorRef}
      />
    </div>
  )
} 