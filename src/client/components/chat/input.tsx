import {
  ArrowUp,
  AtSign,
  Baseline,
  Bold,
  CodeXml,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Loader,
  Loader2,
  Paperclip,
  Quote,
  Smile,
  Strikethrough,
  Table,
  Underline,
  X,
} from 'lucide-react';
import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn, prettyFileType } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import { Id } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmojiPicker, EmojiPickerContent, EmojiPickerSearch } from '@/components/custom/emoji-picker';
import { TooltipButton } from '../custom/tooltip-button';
import prettyBytes from 'pretty-bytes';
import { useLocalStorage } from 'usehooks-ts';

import { 
  useSendMessage, 
  useUploadFile, 
  useCreateDocument, 
  useSyncDocument, 
  useSetTypingState, 
  useTypingStates, 
  useRemoveTypingState, 
  useAgents 
} from '@/hooks/use-convex';

import { Paragraph } from '@tiptap/extension-paragraph';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import BoldExtension from '@tiptap/extension-bold';
import UnderlineExtension from '@tiptap/extension-underline';
import StrikeExtension from '@tiptap/extension-strike';
import ItalicExtension from '@tiptap/extension-italic'
import { MentionSuggestion } from '@/components/tiptap/suggestion';
import { useUser } from '@clerk/clerk-react';
import { useInterval } from 'usehooks-ts';

import type { UIMessage, useChat } from '@ai-sdk/react';
import { UserMessageMetadata } from '@/lib/types';


export function ChatInput({ 
  className, 
  channelId,
  threadId,
  chat,
  isLoading,
  ...props 
}: React.ComponentProps<'div'> & {
  channelId: Id<'channels'>;
  chat: ReturnType<typeof useChat<UIMessage<UserMessageMetadata>>>;
  threadId?: Id<'messages'>;
  isLoading?: boolean;
}) {

  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{
    status: 'uploading' | 'completed', 
    file: File,
    fileId?: string,
  }[]>([]);

  const [showFormatMenu, setShowFormatMenu] = useLocalStorage('showFormatMenu', true);

  const inputId = threadId || channelId;
  const sync = useSyncDocument(inputId);
  const { mutate: createDocument } = useCreateDocument();
  
  const { mutate: setTypingState } = useSetTypingState();
  const { data: typingStates } = useTypingStates(inputId);
  const { mutate: removeTypingState } = useRemoveTypingState();
  const [activeTypingUsers, setActiveTypingUsers] = useState<string[]>([]);

  const { data: agents } = useAgents();
  
  useInterval(() => {
    setActiveTypingUsers(typingStates?.filter(state => Date.now() - state.lastUpdated < 5000).map(state => state.userId) ?? []);
  }, 1000)

  useEffect(() => {
    if (sync.isLoading === false && sync.initialContent === null ) {
      createDocument({ docName: threadId || channelId })
    }
  }, [sync.isLoading, sync.initialContent])

  const { mutate: sendMessage } = useSendMessage();
  const uploadFile = useUploadFile();
  
  const editor = useEditor({
    content: sync.initialContent,
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
      BoldExtension,
      ItalicExtension,
      UnderlineExtension,
      StrikeExtension,
      Placeholder.configure({ placeholder: 'Ask anything, use @ to mention' }),
      MentionSuggestion({ agents: agents || [] }),
      ...(sync.extension ? [sync.extension] : []),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none text-sm min-h-12 max-h-100 overflow-visible"
      },
    },
    onFocus() {},
    onBlur() {},
    onCreate(props) {props.editor.commands.focus('end')},
    onUpdate: ({editor}) => {
      if (editor.isFocused) {
        setTypingState({ fieldId: inputId, userId: user!.id });
      }
    }
  }, [channelId, sync.isLoading, agents])!;

  const isEmpty = !editor.getText().trim() && files.length === 0;
  const submitDisabled = isEmpty || files.some(f => f.status === 'uploading') || isLoading;
  
  const handleSend = () => {
    if (submitDisabled) return;

    const message = editor.getText();
    const mentions = editor.getJSON().content?.flatMap(node => node.content).filter(node => node?.type === 'mention').map(node => node?.attrs);
    sendMessage({ channelId, text: message, threadId, files: files.map(f => f.fileId as Id<'_storage'>) });

    if (mentions && mentions.length > 0) {
      const mentionItem = mentions[0]!;
      chat.sendMessage({
        role: 'user',
        parts: [{
          type: 'text',
          text: message
        }],
        metadata: {
          channelId,
          agentId: mentionItem.id,
          threadId,
        }
      })
    }


    editor.commands.clearContent();
    setFiles([]);

    removeTypingState({ userId: user!.id });
  }

  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({status: 'uploading' as const, file}));
      setFiles(prev => [...prev, ...newFiles]);
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const fileId = await uploadFile(file);
          setFiles(prev => prev.map(f => f.file === file ? { ...f, status: 'completed', fileId } : f));
        } catch (error) {
          setFiles(prev => prev.filter(f => f.file !== file));
        }
      });
      await Promise.allSettled(uploadPromises);
      e.target.value = '';
    }
  };


  return (
    <div className={cn(
      "m-2 mt-0 flex flex-col gap-2 rounded-md border p-2",
      "overflow-auto",
      "fade-in-0 duration-200 animate-in",
      editor.isFocused && "border-ring ring-2 ring-ring/50",
      className
    )} {...props}
    >
      {/* Context items */}
      <div className={cn("-mx-2 -mt-2 flex flex-row gap-2 border-b bg-muted/50 p-2 overflow-x-auto", files.length === 0 && "hidden")}>
        {files.map((item, index) => (
          <div key={index} className="group/context-item flex flex-row items-center gap-1.5 rounded-md border bg-background p-1 relative cursor-default">
            <div className='rounded p-2 size-8 flex items-center justify-center bg-muted'>
              {item.status === 'uploading' ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Table className="size-4" />}
            </div>
            <div className='flex flex-col max-w-40'>
              <p className="text-xs font-medium truncate">{item.file.name}</p>
              <p className="text-xs text-muted-foreground">{prettyFileType(item.file.type)} • {prettyBytes(item.file.size)}</p>
            </div>
            <TooltipButton 
              variant='outline'
              className='absolute -top-1.5 -right-1.5 rounded-full size-4 p-0 hidden group-hover/context-item:flex' 
              onClick={() => {setFiles(prev => prev.filter(f => f.file !== item.file))}}
            >
              <X className='size-2.5' />
            </TooltipButton>

          </div>
        ))}
      </div>

      <div className={cn("flex flex-row items-center gap-1 -ml-1 -mt-1 overflow-x-auto", !showFormatMenu && "hidden")}>
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('bold') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <Bold className="size-4" />
        </TooltipButton>
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('italic') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <Italic className="size-4" />
        </TooltipButton>
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('underline') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <Underline className="size-4" />
        </TooltipButton>
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('strike') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <Strikethrough className="size-4" />
        </TooltipButton>
        <div className='h-5 border-r' />
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('bulletList') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <List className="size-4" />
        </TooltipButton>
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('orderedList') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <ListOrdered className="size-4" />
        </TooltipButton>
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Checklist"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            "hover:bg-transparent",
            editor.isActive('taskList') ? "bg-muted hover:bg-muted [&>svg]:text-foreground" : "",
          )}
        >
          <ListChecks className="size-4" />
        </TooltipButton>
        <div className='h-5 border-r' />
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeXml className="size-4" />
        </TooltipButton>        
        <TooltipButton
          size="icon"
          variant="ghost"
          tooltip="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </TooltipButton>
      </div>

      <EditorContent 
        editor={editor} 
        onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend()}}}
        className={cn("",)}
      />
      <input
        className="hidden"
        multiple
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
      <div className="flex flex-row items-center gap-1">
        <TooltipButton
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          tooltip="Attach files"
          disabled={files.some(f => f.status === 'uploading')}
        >
          <Paperclip className="size-4" />
        </TooltipButton>
        <TooltipButton
          size="icon"
          onClick={() => {editor?.chain().insertContent('@').focus().run()}}
          variant="ghost"
          tooltip="Add context"
        >
          <AtSign className="size-4" />
        </TooltipButton>
        <Popover>
          <PopoverTrigger asChild>
            <TooltipButton
              size="icon"
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
          size="icon"
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          variant="ghost"
          tooltip="Format text"
        >
          <Baseline className="size-4" />
        </TooltipButton>

        <div className='ml-auto flex flex-row items-center gap-1'>
          {isLoading && <Loader className="size-5 animate-spin" />}
          <Button
            size="icon"
            className={cn("rounded-full")}
            disabled={submitDisabled}
            onClick={handleSend}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
