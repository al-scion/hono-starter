import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Details from '@tiptap-pro/extension-details'
import DetailsContent from '@tiptap-pro/extension-details-content'
import DetailsSummary from '@tiptap-pro/extension-details-summary'
import { useTiptapSync } from '@convex-dev/prosemirror-sync/tiptap'
import { MentionSuggestion } from './suggestion'

export function DocumentEditor({ 
  sync,
  titleInputRef,
  editorRef,
}: { 
  sync: ReturnType<typeof useTiptapSync>;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  editorRef: any;
}) {

  if (!sync.extension) throw new Error("Sync extension not found");
  if (!sync.initialContent) throw new Error("Document not found");

  const editor = useEditor({
    content: sync.initialContent,
    extensions: [
      sync.extension,
      StarterKit.configure({
        code: {
          HTMLAttributes: {
            class: 'bg-muted p-1 rounded-md text-xs',
          }
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'heading-base',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-ordered',
          },
        },
        blockquote: {},
        codeBlock: {},
        horizontalRule: {},
        hardBreak: {},

      }),

      Highlight,
      Typography,
      TaskList,
      TaskItem,
      Details,
      DetailsContent,
      DetailsSummary,
      Placeholder.configure({ placeholder: 'Write something...' }),
      MentionSuggestion,
    ],
    editorProps: {
      attributes: {
        class: "focus-visible:outline-none flex-1 h-full",
      },
      handleKeyDown: (_, event) => {
        if ((event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'Backspace') && editor?.state.selection.$anchor.pos === 1) {
          event.preventDefault()
          titleInputRef.current?.focus()
        }
      }
    },
  })

  // Expose the editor instance via the forwarded ref so callers can access commands (e.g. focus).
  if (editor && editorRef) {
    editorRef.current = editor;
  }

  return (
    <EditorContent editor={editor} className='flex flex-1' />
  )
}