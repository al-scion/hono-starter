import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/tiptap/editor";
import { MessageAssistant } from "@/components/tiptap/message-assistant";
import { MessageUser } from "@/components/tiptap/message-user";
import { Button } from "@/components/ui/button";
import { useRef, useState, ChangeEvent } from "react";
import { ArrowUp, AtSign, Paperclip, Check, Globe, Lightbulb, ChevronsUpDown, Unplug, ChevronDown, Plus, Square, CodeXml, Table, X, Ellipsis, Trash2, PenBox } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandItem, CommandGroup, CommandShortcut, CommandSeparator, CommandInput, CommandEmpty } from "@/components/ui/command";
import { useLocalStorage } from "usehooks-ts";
import { useStickToBottom } from "use-stick-to-bottom";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/state";
import { DefaultChatTransport } from "ai";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Claude, OpenAI, Google } from "@/lib/icons";
import { Kbd } from "@/components/shortcuts/kbd";
import type { Editor as TiptapEditor } from '@tiptap/core'
import { useHotkeys } from "react-hotkeys-hook";
import { useMcpStore, DEFAULT_MCP_SERVERS } from "@/components/mcphost";
import { useChatStore } from "@/components/sidebar/chat";
import { cn } from "@/lib/utils";

const models = [{
  id: 'openai/gpt-4.1',
  label: 'GPT-4.1',
  icon: OpenAI
}, {
  id: 'anthropic/claude-sonnet-4-20250514',
  label: 'Claude 4 Sonnet',
  icon: Claude
}, {
  id: 'google/gemini-2.5-pro-preview-06-05',
  label: 'Gemini 2.5 Pro',
  icon: Google
}, {
  id: 'google/gemini-2.5-flash-preview-05-20',
  label: 'Gemini 2.5 Flash',
  icon: Google
}]

const tools = [{
  id: 'web-search',
  label: 'Web Search',
  description: 'Search the web and read webpages',
  icon: Globe
}, {
  id: 'reasoning',
  label: 'Reasoning',
  description: 'Think step by step before answering',
  icon: Lightbulb
}, {
  id: 'code-interpreter',
  label: 'Code Interpreter',
  description: 'Run code and see the results',
  icon: CodeXml
}]

export function Messages({className, ...props}: React.ComponentProps<'div'>) {
  
  const chats = useLiveQuery(() => db.chats.orderBy('createdAt').reverse().toArray())
  const { chatId, setChatId, contextItems, setIntegrationsDialogOpen, initialMessages, setInitialMessages } = useStore()
  const editorRef = useRef<TiptapEditor>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mcpState, addEnabledMcp, removeEnabledMcp, enabledMcp } = useMcpStore()
  const { toggleOpen } = useChatStore()
  
  const [modelId, setModelId] = useLocalStorage('modelId', models[0].id);
  const selectedModel = models.find(m => m.id === modelId) || models[0];  

  const [enabledTools, setEnabledTools] = useLocalStorage<string[]>('enabledTools', []);

  const { id, messages, status, sendMessage, stop } = useChat({
    id: chatId,
    generateId: () => crypto.randomUUID(),
    transport: new DefaultChatTransport({
      api: '/api/chat/stream',
    }),
    messages: initialMessages,
    onFinish({message}) {db.messages.add({...message, chatId} )},
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const { scrollRef, contentRef } = useStickToBottom();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      console.log("Uploaded files:", Array.from(files));
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = "";
  };

  const handleNewChat = () => {
    setInitialMessages([]);
    setChatId(crypto.randomUUID());
  }

  useHotkeys('ctrl+j, meta+j', handleNewChat, {enableOnContentEditable: true, enableOnFormTags: true})

  return (
    <div className={cn("flex flex-col flex-1", className)} {...props}>

      <div className="flex flex-row items-center gap-2 h-10 p-2 border-b">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-7 px-2 gap-1">
              {chats?.find(chat => chat.id === chatId)?.title || 'New Chat'}
              <ChevronDown className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 w-80">
            <Command>
              <CommandInput />
              <CommandList>
                <CommandEmpty>No chats found</CommandEmpty>
                <CommandGroup>
                {chats?.map((chat) => (
                  <CommandItem 
                    key={chat.id} 
                    value={chat.title} 
                    className='group truncate'
                    onSelect={async () => {
                      setInitialMessages(await db.messages.where('chatId').equals(chat.id).toArray());
                      setChatId(chat.id);
                    }} 
                  >
                    {chatId === chat.id && <div className="size-1.5 rounded-full bg-green-600" />}
                    <span className="truncate">{chat.title}</span>
                    <CommandShortcut className="opacity-0 group-data-[selected=true]:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="size-7 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800">
                            <Ellipsis className="size-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align='end' alignOffset={-8} sideOffset={10} className="p-1 max-w-40 flex flex-col">
                          <Button variant="ghost" size='sm' className='px-2 justify-start font-normal' >
                            <PenBox className="size-4" />
                            Rename
                          </Button>
                          <Button variant="ghost" size='sm' className='px-2 justify-start font-normal' 
                            onClick={() => {
                              db.chats.delete(chat.id)
                              db.messages.where('chatId').equals(chat.id).delete()
                              if (chatId === chat.id) {
                                setInitialMessages([]);
                                setChatId(crypto.randomUUID())
                              }
                            }}>
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
        <div className="flex flex-row gap-1 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="size-6 p-0" onClick={handleNewChat}>
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              New chat
              <Kbd keys={['⌘', 'N']} variant="secondary"/>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="size-6 p-0" onClick={() => toggleOpen()}>
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Hide chat
              <Kbd shortcutId="rightSidebarToggle" variant="secondary"/>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>


      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 px-3 text-sm" style={{ overflow: 'auto' }}>
        <div ref={contentRef} className="space-y-3">
          {messages.map((message, messageIndex) => {

            if (message.role === 'user') {
              return (
                <div key={message.id}>
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return <MessageUser key={index} text={part.text} metadata={message.metadata} />;
                    }
                    return null;
                  })}
                  
                </div>
              );
            }

            if (message.role === 'assistant') {
              const sources = message.parts.filter(part => part.type === 'source-url');

              return <div key={`assistant-${message.id}`} className={`space-y-2 ${messageIndex === messages.length - 1 ? "min-h-[calc(100dvh-20rem)]" : ""}`}>
                {sources.length > 0 && 
                  <Accordion type="single" collapsible className="w-full border rounded-lg">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <Globe className="size-4" />
                        Search
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col px-1">
                        {sources.map((source, index) => (
                          <div 
                            key={index} 
                            onClick={() => window.open(source.url, '_blank')}
                            className="flex flex-row items-center text-sm hover:bg-muted rounded px-2 py-1 gap-2 cursor-pointer"
                          >
                            <Avatar className='size-4'>
                              <AvatarImage  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(source.url).hostname)}&sz=32`} />
                              <AvatarFallback className="border bg-muted">
                                <Globe className="size-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[360px]">{source.title}</span>
                            <span className='text-muted-foreground font-light'>
                              {new URL(source.url).hostname.replace(/^www\./, '')}
                            </span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                }

                
                
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <MessageAssistant key={index} text={part.text} />;
                  }

                  if (part.type === 'reasoning') {
                    return <Accordion 
                      type="single"
                      collapsible 
                      className="w-full border rounded-lg"
                    >
                      <AccordionItem value="reasoning">
                        <AccordionTrigger className="data-[state=open]:border-b data-[state=open]:rounded-b-none">
                          <Lightbulb className="size-4" />
                          Reasoning
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                          <MessageAssistant text={part.text} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  }

                  if (part.type === 'file') {
                    return <p className='bg-blue-100'>FILE: {JSON.stringify(part)}</p>
                  }

                  if (part.type === 'tool-invocation') {
                    // The SDK does not expose a `toolInvocation` property on this part type.
                    // Render the whole object for now to avoid type errors.
                    return <p className='bg-red-100'>TOOL CALL: {JSON.stringify(part)}</p>
                  }

                })}
              </div>
            }
          })}
          
          {/* Loading message while waiting for assistant response */}
          {status === 'submitted' && (
            <div className="min-h-[calc(100dvh-17rem)]">
              <span className="text-muted-foreground animate-pulse">Loading...</span>
            </div>
          )}
        </div>
      </div>


      {/* Input section */}
      <div className="p-2 border rounded-lg flex flex-col gap-2 m-2 mt-0 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-2 animate-in fade-in-0 duration-300 delay-100">

        {contextItems.length > 0 && <div className="flex flex-wrap gap-1 p-2 -mx-2 -mt-2 border-b bg-muted/50 rounded-t-lg">
          {contextItems.map((item, index) => 
            <div key={index} className='group/context-item flex flex-row items-center gap-1 border rounded py-1 px-1 bg-background'>
              <Table className="size-3.5 group-hover/context-item:hidden" />
              <X className="size-3.5 hidden group-hover/context-item:block cursor-pointer" />
              <p className="text-xs">{item.attrs.label}</p>
            </div>
          )}
        </div>}

        <Editor 
          id={id}
          className="focus:outline-none min-h-12 text-sm"
          sendMessage={sendMessage}
          enabledTools={enabledTools}
          editorRef={editorRef}
        />
        {/* Hidden file input for uploads */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-row gap-2">
          <div className="flex-1 h-6 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="size-6 p-0" variant="ghost" onClick={() => {
                  fileInputRef.current?.click();
                }}>
                  <Paperclip className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Attach files
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="size-6 p-0" variant="ghost" onClick={() => {
                  editorRef?.current?.chain()
                  .insertContent('@')
                  .focus()
                  .run()
                }}>
                  <AtSign className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Add context
              </TooltipContent>
            </Tooltip>
            <Popover open={isToolPopoverOpen} onOpenChange={setIsToolPopoverOpen}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="h-6 px-1 text-xs font-medium flex items-center gap-1">
                      <Unplug className="size-4" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  Integrations
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0 relative">
                <Command value={selectedTool} onValueChange={setSelectedTool}>
                  <CommandInput autoFocus />
                  <CommandList>
                    <CommandEmpty>No tools found</CommandEmpty>
                    <CommandGroup heading="Tools">
                      {tools.map((tool) => (
                        <CommandItem
                          key={tool.id}
                          value={tool.label}
                          onSelect={() => setEnabledTools(prev => 
                            prev.includes(tool.id) 
                              ? prev.filter(id => id !== tool.id)
                              : [...prev, tool.id]
                          )}
                          className="flex flex-row items-center gap-2"
                        >
                          <tool.icon className="size-4" />
                          <span>{tool.label}</span>
                          <CommandShortcut>
                            <Switch checked={enabledTools.includes(tool.id)} className="data-[state=checked]:bg-green-600"/>
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Integrations">
                      {Object.entries(mcpState.servers).map(([id, mcp]) => {
                        const mcpConfig = DEFAULT_MCP_SERVERS[mcp.name]
                        const isEnabled = enabledMcp.has(id)
                        return (
                          <CommandItem
                            key={id}
                            value={mcp.name}
                            onSelect={() => isEnabled ? removeEnabledMcp(id) : addEnabledMcp(id)}
                          >
                            {mcpConfig?.icon 
                              ? <mcpConfig.icon className="size-4" /> 
                              : <div className="size-5 border rounded-md bg-muted flex items-center justify-center -ml-0.5">{mcp.name.charAt(0).toUpperCase()}</div>
                            }
                            <span>{mcp.name}</span>
                            <CommandShortcut>
                              <Switch checked={isEnabled} className="data-[state=checked]:bg-green-600" />
                            </CommandShortcut>
                          </CommandItem>
                        )})}
                      <CommandItem onSelect={() => setIntegrationsDialogOpen(true)}>
                        <Plus className="size-4" />
                        <span>Add integrations</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-6 px-1 text-xs font-medium flex items-center gap-1">
                    <selectedModel.icon className="size-4" />
                    <ChevronsUpDown className="size-3" />
                  </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  Switch models
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0">
                <Command defaultValue={models.find(model => model.id === modelId)?.label}>
                  <CommandList>
                    <CommandGroup heading="Models">
                      {models.map((modelOption) => (
                        <CommandItem
                          key={modelOption.id}
                          value={modelOption.label}
                          onSelect={() => {
                            setModelId(modelOption.id);
                            setIsPopoverOpen(false);
                          }}
                          className="flex items-center gap-2"
                        >
                          <modelOption.icon className="size-4" />
                          <span>{modelOption.label}</span>
                          <CommandShortcut>
                            {modelId === modelOption.id && <Check className="size-4" />}
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
              className="size-6 p-0 rounded-full"
              onClick={stop}
              aria-label="Stop"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              className="size-6 p-0 rounded-full"
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}