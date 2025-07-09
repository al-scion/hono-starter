import {
  ArrowUp,
  AtSign,
  Baseline,
  Paperclip,
  Smile,
  Table,
  X,
} from 'lucide-react';
import { type ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import { Id } from '@/lib/api';
import { useDeleteDraft, useDraft, useSaveDraft, useSendAIMessage, useSendMessage } from '@/hooks/use-convex';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmojiPicker, EmojiPickerContent, EmojiPickerSearch } from '@/components/custom/emoji-picker';
import { TooltipButton } from '../custom/tooltip-button';

import { Paragraph } from '@tiptap/extension-paragraph';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import { MentionSuggestion } from '@/components/tiptap/suggestion';


export function ChatInput({ 
  className, 
  channelId,
  threadId,
  ...props 
}: React.ComponentProps<'div'> & {
  channelId: Id<'channels'>;
  threadId?: Id<'messages'>;
}) {

  const { contextItems } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<() => void>(() => {});

  const { mutate: sendMessage } = useSendMessage();
  const { mutate: saveDraft } = useSaveDraft();
  const { mutate: deleteDraft } = useDeleteDraft();
  const { data: draft } = useDraft(channelId)
  const send = useSendAIMessage()
  
  const editor = useEditor({
    content: draft?.text ? JSON.parse(draft.text) : undefined,
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
      Placeholder.configure({ placeholder: 'Ask anything, use @ to mention' }),
      MentionSuggestion,
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none text-sm min-h-12 max-h-100 overflow-auto"
      },
      handleKeyDown: (_, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendRef.current();
          return true;
        }
      },
    },
    onBlur(props) {
      saveDraft({ channelId, text: JSON.stringify(props.editor.state.doc.toJSON()) });
    },
    onCreate(props) {},
  }, [channelId, draft?.text])!;

  const isEmpty = !editor.getText().trim();
  
  const handleSend = () => {
    if (isEmpty) return;
    const message = editor.getText();
    sendMessage({ channelId, text: message, threadId });
    editor.commands.clearContent();
    deleteDraft({ channelId });
  }
  sendRef.current = handleSend;

  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {}
    e.target.value = '';
  };

  return (
    <div className={cn(
      "m-2 mt-0 flex flex-col gap-2 rounded-md border p-2",
      "overflow-auto",
      "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
      "fade-in-0 delay-100 duration-300 animate-in",
      className
    )} {...props}
    >
      
      {/* Context items */}
      {contextItems.length > 0 && (
        <div className="-mx-2 -mt-2 flex flex-wrap gap-1 border-b bg-muted/50 p-2">
          {contextItems.map((item, index) => (
            <div
              className="group/context-item flex flex-row items-center gap-1 rounded border bg-background px-1 py-1"
              key={index}
            >
              <Table className="size-3.5 group-hover/context-item:hidden" />
              <X className="hidden size-3.5 cursor-pointer group-hover/context-item:block" />
              <p className="text-xs">{item.attrs.label}</p>
            </div>
          ))}
        </div>
      )}


      <EditorContent key={channelId} editor={editor} className=''/>
      <input
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
      <div className="flex flex-row gap-2">
        <div className="flex h-6 flex-1 items-center gap-1">
          <TooltipButton
            className="size-6 p-0"
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            tooltip="Attach files"
          >
            <Paperclip className="size-4" />
          </TooltipButton>
          <TooltipButton
            className="size-6 p-0"
            onClick={() => {editor?.chain().insertContent('@').focus().run()}}
            variant="ghost"
            tooltip="Add context"
          >
            <AtSign className="size-4" />
          </TooltipButton>
          <Popover>
              <PopoverTrigger asChild>
                <TooltipButton
                  className="size-6 p-0"
                  variant="ghost"
                  tooltip="Add emojis"
                >
                  <Smile className="size-4" />
                </TooltipButton>
              </PopoverTrigger>
            <PopoverContent alignOffset={-7} className="max-h-64 overflow-y-auto p-0 w-fit">
              <EmojiPicker onEmojiSelect={(emoji) => editor.chain().insertContent(emoji.emoji).focus().run()}>
                <EmojiPickerSearch />
                <EmojiPickerContent />
              </EmojiPicker>
            </PopoverContent>
          </Popover>
          <TooltipButton
            className="size-6 p-0"
            onClick={() => {send({ channelId, text: "Write me an essay with 30 short sentences"})}}
            variant="ghost"
            tooltip="Format text"
          >
            <Baseline className="size-4" />
          </TooltipButton>
        </div>

        <Button 
          aria-label="Send"
          className={cn("size-6 p-0 rounded-full",)} 
          disabled={isEmpty}
          onClick={handleSend}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
