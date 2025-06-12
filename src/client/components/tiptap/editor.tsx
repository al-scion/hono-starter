import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Mention from '@tiptap/extension-mention'
import HardBreak from '@tiptap/extension-hard-break'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react'
import suggestion from './suggestion'
import { useStore } from '@/lib/state';
import type { useChat } from '@ai-sdk/react';
import { useLocalStorage } from 'usehooks-ts';

interface EditorProps {
  id: string
  placeholder?: string
  className?: string
  sendMessage: ReturnType<typeof useChat>['sendMessage']
  enabledTools?: string[]
  [key: string]: any
}

export function Editor(
  { 
    id,
    placeholder,
    sendMessage,
    className,
    enabledTools = [],
    ...props
  }: EditorProps
) {

  const { setContextItems } = useStore();
  const [modelId] = useLocalStorage('modelId', '');

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
      Placeholder.configure({ placeholder }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-blue-100 text-blue-800 px-1 py-0.5 rounded focus:outline-none',
        },
        suggestion: {
          ...suggestion,
          decorationClass: 'bg-muted px-1 py-0.5 rounded',
          allowSpaces: true,
        },
        deleteTriggerWithBackspace: true,
      }),
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
          if (text) {
            sendMessage({
              role: 'user',
              parts: [{ type: 'text', text }],
              metadata: {
                content: content,
              },
              
            }, {
              headers: {
                modelId: modelId,
                'enabled-tools': JSON.stringify(enabledTools),
              }
            })
            editor?.commands.clearContent()
          }
          return true
        }
        return false
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

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}
