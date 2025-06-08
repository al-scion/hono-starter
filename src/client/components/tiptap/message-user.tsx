import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link';
import { marked } from 'marked'
import { useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from '@clerk/clerk-react'

interface MessageUserProps {
  text: string;
}

export function MessageUser({ text }: MessageUserProps) {
  const { user } = useUser()
  const avatarUrl = user?.imageUrl

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

  return (
    <div className="flex flex-row items-start gap-2 border rounded-lg bg-muted px-3 py-2">
      <Avatar className="size-5">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          {user?.firstName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <EditorContent editor={editor} />
    </div>
  )
}