import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Mention from '@tiptap/extension-mention'
import HardBreak from '@tiptap/extension-hard-break'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import suggestion from './suggestion'

interface EditorProps {
  value: string
  disabled?: boolean
  placeholder?: string
  className?: string
  append?: (message: any) => void
  [key: string]: any
}

export function Editor(
  { 
    value, 
    disabled, 
    placeholder,
    append,
    className,
    ...props
  }: EditorProps
) {
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
      }),
    ],
    editable: !disabled,
    content: value,
    editorProps: {
      attributes: {
        class: `mx-auto ${className}`,
      },
      handleKeyDown: (_, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          
          const text = editor?.getText().trim()
          if (append && text) {
            append({
              role: 'user',
              parts: [{ type: 'text', text }]
            })
            editor?.commands.clearContent()
          }
          return true
        }
        return false
      },
    },
    ...props,
  })

  return <EditorContent editor={editor} />
}
