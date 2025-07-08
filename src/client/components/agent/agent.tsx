import type { Editor as TiptapEditor } from '@tiptap/core';
import { useRef } from 'react';
import { DocumentEditor } from '@/components/tiptap/document-editor';
import type { Doc } from '@/lib/api';
import { Button } from '../ui/button';
import { WandSparkles } from 'lucide-react';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../custom/custom-card';

export function Agent({ agent }: { agent: Doc<'agents'> }) {

  const editorRef = useRef<TiptapEditor>(null);

  return (
    <div className="flex flex-col gap-2 overflow-auto h-full">
      <Card className='flex-1'>
        <CardHeader className='flex flex-row'>
          <Label>Instructions</Label>
          <Button variant='ghost' className='ml-auto size-6 p-0' onClick={() => {console.log(editorRef.current?.state.doc.toJSON())}}>
            <WandSparkles className='size-4' />
          </Button>
        </CardHeader>
        <CardContent className='flex flex-col flex-1 p-2'>
          <DocumentEditor editorRef={editorRef} agent={agent} />
        </CardContent>
      </Card>
    </div>
  );
}
