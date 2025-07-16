import { useEffect } from 'react';
import type { Doc } from '@/lib/api';
import { Button } from '../ui/button';
import { WandSparkles } from 'lucide-react';
import { Label } from '../ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '../custom/custom-card';
import { useSyncDocument, useCreateDocument, useAgents } from '@/hooks/use-convex';
import { useState } from 'react';

import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details from '@tiptap-pro/extension-details';
import DetailsContent from '@tiptap-pro/extension-details-content';
import DetailsSummary from '@tiptap-pro/extension-details-summary';
import Link from '@tiptap/extension-link';
import { CharacterCount } from '@tiptap/extensions'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { MentionSuggestion, SlashCommand } from '@/components/tiptap/suggestion';
import { PlaceholderExtension } from '@/components/tiptap/placeholder';


export function Agent({ agent }: { agent: Doc<'agents'> }) {

  const sync = useSyncDocument(`system_${agent._id}`);
  const { mutate: createDocument } = useCreateDocument();
  const [characterCount, setCharacterCount] = useState(0);
  const { data: agents } = useAgents();

  useEffect(() => {
    if (sync.isLoading === false && sync.initialContent === null) {
      createDocument({ docName: `system_${agent._id}` })
    }
  }, [sync.isLoading, sync.initialContent])

  const editor = useEditor({
    content: sync.initialContent,
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      TaskList,
      TaskItem,
      Details,
      DetailsContent,
      DetailsSummary,
      Link.configure({
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
        },
      }),
      PlaceholderExtension,
      MentionSuggestion({ agents: agents || [] }),
      SlashCommand,
      CharacterCount,
      ...(sync.extension ? [sync.extension] : []),
    ],
    editorProps: {
      attributes: {
        class: 'focus-visible:outline-none flex-1 h-full overflow-visible',
      },
    },
    onCreate({ editor }) {
      editor.commands.focus('end')
      setCharacterCount(editor.storage.characterCount.characters());
    },
    onUpdate({ editor }) {
      setCharacterCount(editor.storage.characterCount.characters());
    },
  }, [agent._id, sync.isLoading, agents])!;

  return (
    <Card className='flex-1 flex flex-col h-full'>
      <CardHeader className='flex flex-row flex-shrink-0'>
        <Label>Instructions</Label>
        <Button variant='ghost' className='ml-auto size-6 p-0' onClick={() => {}}>
          <WandSparkles className='size-4' />
        </Button>
      </CardHeader>
      <CardContent className='flex flex-col flex-1 min-h-0 p-2'>
        <EditorContent editor={editor} className='flex flex-1 flex-col' />
      </CardContent>
      <CardFooter>
        <span className='text-xs text-muted-foreground ml-auto'>{characterCount} characters</span>
      </CardFooter>
    </Card>
  );
}
