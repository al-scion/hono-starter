import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Mention from '@tiptap/extension-mention'
import HardBreak from '@tiptap/extension-hard-break'
import { Extension } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import suggestion from './suggestion'

// Custom extension to handle Enter key behavior
const EnterKeyHandler = Extension.create({
  name: 'enterKeyHandler',
  
  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        // Prevent default Enter behavior (creating new paragraphs)
        console.log('Enter pressed - would submit here')
        return true // Return true to prevent default behavior
      },
      'Shift-Enter': () => {
        // Explicitly handle Shift+Enter for line breaks
        return this.editor.commands.setHardBreak()
      },
    }
  },
})

export default function TiptapEditor() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
      EnterKeyHandler,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-blue-100 text-blue-800 px-1 py-0.5 rounded',
        },
        suggestion,
      }),
    ],
    content: `
      <p>
        What do you all think about the new <span data-type="mention" data-id="user_7" data-label="Winona Ryder">@Winona Ryder</span> movie?<br />Type your message here...
      </p>
    `,
    editorProps: {
      attributes: {
        class: 'min-h-[200px] p-4 border rounded-md resize-none',
        role: 'textbox',
      },
    },
  })

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null

      return {
        content: editor.getJSON(),
        html: editor.getHTML(),
        text: editor.getText(),
      }
    },
  })

  const mentionedItems = [...new Map(
    (editorState?.content?.content?.[0]?.content
      ?.filter(node => node.type === 'mention' && node.attrs?.id)
      .map(mention => ({ id: mention.attrs?.id, label: mention.attrs?.label })) ?? [])
      .map(m => [m.id, m])
  ).values()]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="mb-2 text-sm">
        Type @ to mention someone • Use Shift+Enter for new lines • Enter to submit
      </div>
      
      <EditorContent editor={editor} />
      
      {/* Display editor state as JSON */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Editor State (JSON):</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
          {JSON.stringify(mentionedItems, null, 2)}
        </pre>
      </div>
    </div>
  )
}
