import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link';
import { marked } from 'marked'
import { useEffect } from 'react'

interface MessageAssistantProps {
  text: string;
}

export function MessageAssistant({ text }: MessageAssistantProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: false,
      })
    ],
    editable: false,
  })

  useEffect(() => {
    if (editor && text) {
      const htmlContent = marked(text, {
        breaks: true,  // Convert \n to <br>
        gfm: true,     // Enable GitHub Flavored Markdown
        async: false
      })
      editor.commands.setContent(htmlContent)
    }
  }, [text, editor])

  return <EditorContent editor={editor} />
}