import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import HardBreak from '@tiptap/extension-hard-break'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image'
import FileHandler from '@tiptap-pro/extension-file-handler'

import { EditorContent, useEditor } from '@tiptap/react'
import { MentionSuggestion } from './suggestion'
import { useStore } from '@/lib/state';
import type { useChat, UIMessage } from '@ai-sdk/react';
import { useLocalStorage } from 'usehooks-ts';
import { db } from '@/lib/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { api } from '@/lib/api';

export function Editor(
  { 
    id,
    sendMessage,
    className,
    enabledTools = [],
    editorRef,
    ...props
  }: {
    id: string
    sendMessage: ReturnType<typeof useChat>['sendMessage']
    className?: string
    enabledTools?: string[]
    editorRef: any
  }
) {

  const { setContextItems } = useStore();
  const [modelId] = useLocalStorage('modelId', '');
  const chat = useLiveQuery(() => db.chats.get(id))

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
      Image,
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        onDrop(editor, files, pos) {
          files.forEach(file => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              editor.chain().insertContentAt(pos, {
                type: 'image',
                attrs: {
                  src: fileReader.result,
                },
              }).focus().run()
            }
          })
        },
        onPaste(editor, files, htmlContent) {
          files.forEach(file => {
            if (htmlContent) {
              return false
            }
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              editor.chain().insertContentAt(editor.state.selection.anchor, {
                type: 'image',
                attrs: {
                  src: fileReader.result,
                },
              }).focus().run()
            }
          })
        },
      }),
      Placeholder.configure({ placeholder: "Ask anything, use @ to mention" }),
      MentionSuggestion,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'bg-blue-100 text-blue-800 px-1 py-0.5 rounded focus:outline-none',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: `mx-auto ${className}`,
      },
      handleKeyDown: (_, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          
          const text = editor?.getText().trim()
          const content = editor?.getHTML()
          if (!text) throw new Error('No text to send')

          const message: UIMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            parts: [{ type: 'text', text }],
            metadata: { content },
          }
          sendMessage(message, {
            headers: {
              modelId: modelId,
              'enabled-tools': JSON.stringify(enabledTools),
            }
          })
          editor?.commands.clearContent()
          setContextItems([])
          
          db.messages.add({
            ...message,
            chatId: id,
          })
          if (!chat) {
            db.chats.add({id, title: 'New Chat', createdAt: new Date()})
            api.chat['generate-title'].$post({json: { messages: [message] }})
              .then(data => data.json())
              .then(({ title }) => db.chats.update(id, { title }))
              .catch(console.error)
          }
          return true
        }
      },
    },
    onUpdate(props) {
      // Extract mention items from the editor's JSON content and set them in state
      const docContent = props.editor?.getJSON()?.content ?? [];
      const mentions = Array.from(
        new Map(
          docContent
            .flatMap((node: any) => node.content ?? [])
            .filter((item: any) => item.type === 'mention')
            .map((item: any) => [item.attrs?.id ?? JSON.stringify(item), item])
        ).values()
      );
      setContextItems(mentions);
    },
    ...props,
  })

  if (!editor) throw new Error('Editor not found')
  editorRef.current = editor

  return (
    <EditorContent editor={editor} />
  )
}
