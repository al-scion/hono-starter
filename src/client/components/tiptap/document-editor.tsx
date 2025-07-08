import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Typography from '@tiptap/extension-typography';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details from '@tiptap-pro/extension-details';
import DetailsContent from '@tiptap-pro/extension-details-content';
import DetailsSummary from '@tiptap-pro/extension-details-summary';
import CharacterCount from '@tiptap/extension-character-count'
import { MentionSuggestion, SlashCommand } from './suggestion';
import { useMutateSystem } from '@/hooks/use-convex';
import { useDebounceCallback } from 'usehooks-ts'

import type { Editor } from '@tiptap/core';
import { useEffect, type RefObject } from 'react';
import type { Doc } from '@/lib/api';
  
export function DocumentEditor({
  editorRef,
  agent,
}: {
  editorRef: RefObject<Editor | null>;
  agent: Doc<'agents'>;
}) {

  const { mutate: mutateSystem } = useMutateSystem();
  const debouncedUpdate = useDebounceCallback(mutateSystem, 500);

  const editor = useEditor({
    content: agent.system ? JSON.parse(agent.system) : undefined,
    extensions: [
      StarterKit.configure({
        code: {
          HTMLAttributes: {
            class: 'bg-muted p-1 rounded-md text-xs',
          },
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
      SlashCommand,
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: 'focus-visible:outline-none flex-1 h-full',
      },
      handleKeyDown: () => {},
    },
    onCreate(props) {
      editorRef.current = props.editor;
    },
    onUpdate(props) {
      debouncedUpdate({
        agentId: agent._id,
        system: JSON.stringify(props.editor.state.doc.toJSON()),
      });
    },
  }, [agent._id]);

  useEffect(() => {
    if (editor && !editor.isFocused) {
      editor.commands.setContent(agent.system ? JSON.parse(agent.system) : undefined);
    }
  }, [agent.system]);

  return (
    <EditorContent editor={editor} className='flex flex-col flex-1' />
  );
}
