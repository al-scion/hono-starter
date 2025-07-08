import { useChat } from '@ai-sdk/react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { DefaultChatTransport } from 'ai';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowUp,
  AtSign,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CodeXml,
  Ellipsis,
  Globe,
  Lightbulb,
  Paperclip,
  PenBox,
  Plus,
  Square,
  Table,
  Trash2,
  Unplug,
  X,
} from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useStickToBottom } from 'use-stick-to-bottom';
import { useLocalStorage } from 'usehooks-ts';
import { DEFAULT_MCP_SERVERS, useMcpStore } from '@/components/mcphost';
import { Kbd } from '@/components/shortcuts/kbd';
import { Editor } from '@/components/tiptap/editor';
import { MessageAssistant } from '@/components/tiptap/message-assistant';
import { MessageUser } from '@/components/tiptap/message-user';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { db } from '@/lib/dexie';
import { Claude, Google, OpenAI } from '@/lib/icons';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';

const models = [
  {
    id: 'openai/gpt-4.1',
    label: 'GPT-4.1',
    icon: OpenAI,
  },
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    label: 'Claude 4 Sonnet',
    icon: Claude,
  },
  {
    id: 'google/gemini-2.5-pro-preview-06-05',
    label: 'Gemini 2.5 Pro',
    icon: Google,
  },
  {
    id: 'google/gemini-2.5-flash-preview-05-20',
    label: 'Gemini 2.5 Flash',
    icon: Google,
  },
];

const tools = [
  {
    id: 'web-search',
    label: 'Web Search',
    description: 'Search the web and read webpages',
    icon: Globe,
  },
  {
    id: 'reasoning',
    label: 'Reasoning',
    description: 'Think step by step before answering',
    icon: Lightbulb,
  },
  {
    id: 'code-interpreter',
    label: 'Code Interpreter',
    description: 'Run code and see the results',
    icon: CodeXml,
  },
];

export function Messages({ className, ...props }: React.ComponentProps<'div'>) {
  const chats = useLiveQuery(() =>
    db.chats.orderBy('createdAt').reverse().toArray()
  );
  const {
    chatId,
    setChatId,
    contextItems,
    setIntegrationsDialogOpen,
    initialMessages,
    setInitialMessages,
    toggleRightSidebarCollapse,
  } = useStore();
  const editorRef = useRef<TiptapEditor>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mcpState, addEnabledMcp, removeEnabledMcp, enabledMcp } =
    useMcpStore();

  const [modelId, setModelId] = useLocalStorage('modelId', models[0].id);
  const selectedModel = models.find((m) => m.id === modelId) || models[0];

  const [enabledTools, setEnabledTools] = useLocalStorage<string[]>(
    'enabledTools',
    []
  );

  const { id, messages, status, sendMessage, stop } = useChat({
    id: chatId,
    generateId: () => crypto.randomUUID(),
    transport: new DefaultChatTransport({
      api: '/api/chat/stream',
    }),
    messages: initialMessages,
    onFinish({ message }) {
      db.messages.add({ ...message, chatId });
    },
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const { scrollRef, contentRef } = useStickToBottom();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleNewChat = () => {
    setInitialMessages([]);
    setChatId(crypto.randomUUID());
  };

  useHotkeys('ctrl+j, meta+j', handleNewChat, {
    enableOnContentEditable: true,
    enableOnFormTags: true,
  });

  return (
    <div className={cn('flex flex-1 flex-col', className)} {...props}>
      <div className="flex h-10 flex-row items-center gap-2 border-b p-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="h-7 gap-1 px-2" variant="ghost">
              {chats?.find((chat) => chat.id === chatId)?.title || 'New Chat'}
              <ChevronDown className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-0">
            <Command>
              <CommandInput />
              <CommandList>
                <CommandEmpty>No chats found</CommandEmpty>
                <CommandGroup>
                  {chats?.map((chat) => (
                    <CommandItem
                      className="group truncate"
                      key={chat.id}
                      onSelect={async () => {
                        setInitialMessages(
                          await db.messages
                            .where('chatId')
                            .equals(chat.id)
                            .toArray()
                        );
                        setChatId(chat.id);
                      }}
                      value={chat.title}
                    >
                      {chatId === chat.id && (
                        <div className="size-1.5 rounded-full bg-green-600" />
                      )}
                      <span className="truncate">{chat.title}</span>
                      <CommandShortcut
                        className="opacity-0 group-data-[selected=true]:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              className="size-7 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                              variant="ghost"
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            alignOffset={-8}
                            className="flex max-w-40 flex-col p-1"
                            sideOffset={10}
                          >
                            <Button
                              className="justify-start px-2 font-normal"
                              size="sm"
                              variant="ghost"
                            >
                              <PenBox className="size-4" />
                              Rename
                            </Button>
                            <Button
                              className="justify-start px-2 font-normal"
                              onClick={() => {
                                db.chats.delete(chat.id);
                                db.messages
                                  .where('chatId')
                                  .equals(chat.id)
                                  .delete();
                                if (chatId === chat.id) {
                                  setInitialMessages([]);
                                  setChatId(crypto.randomUUID());
                                }
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="ml-auto flex flex-row gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-6 p-0"
                onClick={handleNewChat}
                variant="ghost"
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              New chat
              <Kbd keys={['⌘', 'N']} variant="secondary" />
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-6 p-0"
                onClick={toggleRightSidebarCollapse}
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Hide chat
              <Kbd shortcutId="rightSidebarToggle" variant="secondary" />
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-3 py-4 text-sm" ref={scrollRef}>
        <div className="space-y-3" ref={contentRef}>
          {messages.map((message, messageIndex) => {
            if (message.role === 'user') {
              return (
                <div key={message.id}>
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return (
                        <MessageUser
                          key={index}
                          metadata={message.metadata}
                          text={part.text}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              );
            }

            if (message.role === 'assistant') {
              const sources = message.parts.filter(
                (part) => part.type === 'source-url'
              );

              return (
                <div
                  className={`space-y-2 ${messageIndex === messages.length - 1 ? 'min-h-[calc(100dvh-20rem)]' : ''}`}
                  key={`assistant-${message.id}`}
                >
                  {sources.length > 0 && (
                    <Accordion
                      className="w-full rounded-lg border"
                      collapsible
                      type="single"
                    >
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          <Globe className="size-4" />
                          Search
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col px-1">
                          {sources.map((source, index) => (
                            <div
                              className="flex cursor-pointer flex-row items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                              key={index}
                              onClick={() => window.open(source.url, '_blank')}
                            >
                              <Avatar className="size-4">
                                <AvatarImage
                                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(source.url).hostname)}&sz=32`}
                                />
                                <AvatarFallback className="border bg-muted">
                                  <Globe className="size-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="max-w-[360px] truncate">
                                {source.title}
                              </span>
                              <span className="font-light text-muted-foreground">
                                {new URL(source.url).hostname.replace(
                                  /^www\./,
                                  ''
                                )}
                              </span>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return <MessageAssistant key={index} text={part.text} />;
                    }

                    if (part.type === 'reasoning') {
                      return (
                        <Accordion
                          className="w-full rounded-lg border"
                          collapsible
                          type="single"
                        >
                          <AccordionItem value="reasoning">
                            <AccordionTrigger className="data-[state=open]:rounded-b-none data-[state=open]:border-b">
                              <Lightbulb className="size-4" />
                              Reasoning
                            </AccordionTrigger>
                            <AccordionContent className="p-2">
                              <MessageAssistant text={part.text} />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    }

                    if (part.type === 'file') {
                      return (
                        <p className="bg-blue-100">
                          FILE: {JSON.stringify(part)}
                        </p>
                      );
                    }

                    if (part.type === 'tool-invocation') {
                      // The SDK does not expose a `toolInvocation` property on this part type.
                      // Render the whole object for now to avoid type errors.
                      return (
                        <p className="bg-red-100">
                          TOOL CALL: {JSON.stringify(part)}
                        </p>
                      );
                    }
                  })}
                </div>
              );
            }
          })}

          {/* Loading message while waiting for assistant response */}
          {status === 'submitted' && (
            <div className="min-h-[calc(100dvh-17rem)]">
              <span className="animate-pulse text-muted-foreground">
                Loading...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Input section */}
      <div className="fade-in-0 m-2 mt-0 flex animate-in flex-col gap-2 rounded-md border p-2 delay-100 duration-300 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 overflow-auto">
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

        <Editor
          className="min-h-12 text-sm focus:outline-none"
          editorRef={editorRef}
          enabledTools={enabledTools}
          id={id}
          sendMessage={sendMessage}
        />
        {/* Hidden file input for uploads */}
        <input
          className="hidden"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <div className="flex flex-row gap-2">
          <div className="flex h-6 flex-1 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-6 p-0"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  variant="ghost"
                >
                  <Paperclip className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-6 p-0"
                  onClick={() => {
                    editorRef?.current
                      ?.chain()
                      .insertContent('@')
                      .focus()
                      .run();
                  }}
                  variant="ghost"
                >
                  <AtSign className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add context</TooltipContent>
            </Tooltip>
            <Popover
              onOpenChange={setIsToolPopoverOpen}
              open={isToolPopoverOpen}
            >
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      className="flex h-6 items-center gap-1 px-1 font-medium text-xs"
                      variant="ghost"
                    >
                      <Unplug className="size-4" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>Integrations</TooltipContent>
              </Tooltip>
              <PopoverContent className="relative p-0">
                <Command onValueChange={setSelectedTool} value={selectedTool}>
                  <CommandInput autoFocus />
                  <CommandList>
                    <CommandEmpty>No tools found</CommandEmpty>
                    <CommandGroup heading="Tools">
                      {tools.map((tool) => (
                        <CommandItem
                          className="flex flex-row items-center gap-2"
                          key={tool.id}
                          onSelect={() =>
                            setEnabledTools((prev) =>
                              prev.includes(tool.id)
                                ? prev.filter((id) => id !== tool.id)
                                : [...prev, tool.id]
                            )
                          }
                          value={tool.label}
                        >
                          <tool.icon className="size-4" />
                          <span>{tool.label}</span>
                          <CommandShortcut>
                            <Switch
                              checked={enabledTools.includes(tool.id)}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Integrations">
                      {Object.entries(mcpState.servers).map(([id, mcp]) => {
                        const mcpConfig = DEFAULT_MCP_SERVERS[mcp.name];
                        const isEnabled = enabledMcp.has(id);
                        return (
                          <CommandItem
                            key={id}
                            onSelect={() =>
                              isEnabled
                                ? removeEnabledMcp(id)
                                : addEnabledMcp(id)
                            }
                            value={mcp.name}
                          >
                            {mcpConfig?.icon ? (
                              <mcpConfig.icon className="size-4" />
                            ) : (
                              <div className="-ml-0.5 flex size-5 items-center justify-center rounded-md border bg-muted">
                                {mcp.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>{mcp.name}</span>
                            <CommandShortcut>
                              <Switch
                                checked={isEnabled}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </CommandShortcut>
                          </CommandItem>
                        );
                      })}
                      <CommandItem
                        onSelect={() => setIntegrationsDialogOpen(true)}
                      >
                        <Plus className="size-4" />
                        <span>Add integrations</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      className="flex h-6 items-center gap-1 px-1 font-medium text-xs"
                      variant="ghost"
                    >
                      <selectedModel.icon className="size-4" />
                      <ChevronsUpDown className="size-3" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>Switch models</TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0">
                <Command
                  defaultValue={
                    models.find((model) => model.id === modelId)?.label
                  }
                >
                  <CommandList>
                    <CommandGroup heading="Models">
                      {models.map((modelOption) => (
                        <CommandItem
                          className="flex items-center gap-2"
                          key={modelOption.id}
                          onSelect={() => {
                            setModelId(modelOption.id);
                            setIsPopoverOpen(false);
                          }}
                          value={modelOption.label}
                        >
                          <modelOption.icon className="size-4" />
                          <span>{modelOption.label}</span>
                          <CommandShortcut>
                            {modelId === modelOption.id && (
                              <Check className="size-4" />
                            )}
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {status === 'submitted' || status === 'streaming' ? (
            <Button
              aria-label="Stop"
              className="size-6 rounded-full p-0"
              onClick={stop}
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button aria-label="Send" className="size-6 rounded-full p-0">
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
