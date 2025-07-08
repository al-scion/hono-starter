import { useUser } from '@clerk/clerk-react';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageUserProps {
  text: string;
  metadata?: any;
}

export function MessageUser({ metadata }: MessageUserProps) {
  const { user } = useUser();
  const avatarUrl = user?.imageUrl || undefined;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: false,
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            'mention bg-blue-100 text-blue-800 px-1 py-0.5 rounded focus:outline-none',
        },
      }),
    ],
    editable: false,
    content: metadata?.content as string,
  });

  return (
    <div className="flex flex-row items-start gap-2 rounded-lg border bg-muted px-3 py-2">
      <Avatar className="size-5">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <User className="size-5 rounded-full border bg-background p-0.5" />
        </AvatarFallback>
      </Avatar>
      <EditorContent editor={editor} />
    </div>
  );
}
