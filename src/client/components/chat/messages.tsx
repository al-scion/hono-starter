import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/tiptap/editor";
import { MessageAssistant } from "@/components/tiptap/message-assistant";
import { MessageUser } from "@/components/tiptap/message-user";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUp, AtSign, Paperclip, Check, Globe, Lightbulb, ChevronsUpDown, Unplug, ChevronDown, Plus, History, Square, CodeXml, Table, X, Wrench, ArrowRight, Loader2, Settings, ArrowLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandItem, CommandGroup, CommandShortcut, CommandSeparator, CommandInput } from "@/components/ui/command";
import { useLocalStorage } from "usehooks-ts";
import { useStickToBottom } from "use-stick-to-bottom";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/state";
import { DefaultChatTransport } from "ai";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "../ui/textarea";

const models = [{
  id: 'openai/gpt-4.1',
  label: 'GPT-4.1',
  iconUrl: '/svg/openai.svg'
}, {
  id: 'anthropic/claude-sonnet-4-20250514',
  label: 'Claude 4 Sonnet',
  iconUrl: '/svg/claude.svg'
}, {
  id: 'google/gemini-2.5-pro-preview-06-05',
  label: 'Gemini 2.5 Pro',
  iconUrl: '/svg/google.svg'
// }, {
//   id: 'google/gemini-2.5-flash-preview-05-20',
//   label: 'Gemini 2.5 Flash',
//   iconUrl: '/svg/google.svg'
// }, {
//   id: 'meta/llama-4-maverick-03-26-experimental',
//   label: 'Llama 4 Maverick',
//   iconUrl: '/svg/meta.svg'
// }, {
//   id: 'deepseek/deepseek-v3-0324',
//   label: 'DeepSeek V3',
//   iconUrl: '/svg/deepseek.svg'
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

interface mcpServer {
  type: 'url',
  url: string,
  name: string,
  headers?: Record<string, string>,
  authorization_token?: string,
  tool_configuration?: {
    enabled?: boolean,
    allowed_tools: string[]
  },
}

const mcpServers: mcpServer[] = [{
  type: 'url',
  url: 'https://mcp.context7.com/mcp',
  name: 'Context7',
}, {
  type: 'url',
  url: 'https://mcp.notion.com/mcp',
  name: 'Notion',
}, {
  type: 'url',
  url: 'https://mcp.linear.app/sse',
  name: 'Linear',
}, {
  type: 'url',
  url: 'https://mcp.stripe.com',
  name: 'Stripe',
}, {
  type: 'url',
  url: 'https://mcp.asana.com/sse',
  name: 'Asana',
}, {
  type: 'url',
  url: 'https://mcp.intercom.com/sse',
  name: 'Intercom',
}, {
  type: 'url',
  url: 'https://mcp.deepwiki.com/sse',
  name: 'DeepWiki',
}, {
//   type: 'url',
//   url: 'https://mcp.gmail.com/sse',
//   name: 'Gmail',
// }, {
//   type: 'url',
//   url: 'https://mcp.gmail.com/sse',
//   name: 'Calendar',
// }, {
//   type: 'url',
//   url: 'https://api.dashboard.plaid.com/mcp/sse',
//   name: 'Plaid',
// }, {
  type: 'url',
  url: 'https://app.hubspot.com/mcp/v1/http',
  name: 'Hubspot',
}, {
  type: 'url',
  url: 'https://mcp.zapier.com/api/mcp/mcp',
  name: 'Zapier',
}, {
  type: 'url',
  url: 'https://mcp.squareup.com',
  name: 'Square',
}, {
  type: 'url',
  url: 'https://mcp.paypal.com/sse',
  name: 'Paypal',
}]

export function Messages() {
  const [modelId, setModelId] = useLocalStorage('modelId', models[0].id);
  const { chatId, setChatId } = useStore()
  const selectedModel = models.find(m => m.id === modelId) || models[0];
  
  const [enabledTools, setEnabledTools] = useLocalStorage<string[]>('enabledTools', []);
  const [configuredMCPs, setConfiguredMCPs] = useLocalStorage<string[]>('configuredMCPs', []);
  const [enabledMCPs, setEnabledMCPs] = useLocalStorage<string[]>('enabledMCPs', []);
  const [loadingMCPs, setLoadingMCPs] = useState<string[]>([]);

  const { id, messages, status, sendMessage, stop } = useChat({
    id: chatId,
    generateId: () => crypto.randomUUID(),
    transport: new DefaultChatTransport({
      api: '/api/chat/stream',
    }),
  });

  const [systemInstructions, setSystemInstructions] = useLocalStorage('systemInstructions', '');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);

  const { scrollRef, contentRef } = useStickToBottom();

  const { contextItems } = useStore();

  const handleConnectMCP = async (mcp: mcpServer) => {

    // If already configured, just toggle the enabled state
    const isConfigured = configuredMCPs.some(configured => configured === mcp.name);
    if (isConfigured) {
      setEnabledMCPs(prev => 
        prev.includes(mcp.name)
          ? prev.filter(id => id !== mcp.name)
          : [...prev, mcp.name]
      );
      return;
    }

    try {
      setLoadingMCPs(prev => [...prev, mcp.name])

      const response = await fetch('/api/mcp/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: mcp.name,
          url: mcp.url,
          headers: {
            ...mcp.headers,
            ...(mcp.authorization_token && { 'Authorization': `Bearer ${mcp.authorization_token}` }),
          },
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to register MCP')
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {

            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              console.log(data)

              if (data.authUrl) {
                const popup = window.open(data.authUrl, '_blank')
                if (popup) {
                  popup.addEventListener('beforeunload', () => console.log('window closed'))
                }
              }

              if (data.tools) {
                setEnabledMCPs(prev => 
                  prev.includes(mcp.name)
                    ? prev.filter(id => id !== mcp.name)
                    : [...prev, mcp.name]
                );
                setConfiguredMCPs(prev => [...prev, mcp.name])
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('MCP registration error:', error)
    } finally {
      setLoadingMCPs(prev => prev.filter(name => name !== mcp.name))
    }
  }

  return (
    <div className="h-[calc(100vh-34px)] max-w-screen-sm mx-auto flex flex-col">

      <div className="flex flex-row items-center gap-2 mb-2">

        {/* temporary placeholder, will be for title */}
        <Button variant="ghost" className="h-6 px-1 gap-1">
          New Chat
          <ChevronDown className="size-4" />
        </Button>
        <div className="flex flex-row gap-2 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="size-6 p-0" onClick={() => setChatId(crypto.randomUUID())}>
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              New chat
            </TooltipContent>
          </Tooltip>
          <Button variant="ghost" className="size-6 p-0">
            <History className="size-4" />
          </Button>
        </div>

      </div>


      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 px-2 text-sm" style={{ overflow: 'auto' }}>
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
              // const isReasoningStreaming = message.parts.some(part => part.type === 'reasoning')
              //   && !message.parts.some(part => part.type === 'text')
              //   && status === 'streaming';

              return <div key={`assistant-${message.id}`} className={`space-y-2 ${messageIndex === messages.length - 1 ? "min-h-[calc(100dvh-17rem)]" : ""}`}>

                {sources.length > 0 && 
                  <Accordion type="single" collapsible className="w-full border rounded-lg">
                    <AccordionItem value="item-1" >
                      <AccordionTrigger >
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
                                A
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[360px]">{source.title}</span>
                            <span className='text-muted-foreground font-light'>
                              {new URL(source.url).hostname.replace(/^www\./, '').split('.').slice(-2).join('.')}
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
                        <AccordionTrigger>
                          <Lightbulb className="size-4" />
                          Reasoning
                        </AccordionTrigger>
                        <AccordionContent>
                          <MessageAssistant text={part.text} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  }

                  if (part.type === 'file') {
                    return <p className='bg-blue-100'>FILE: {JSON.stringify(part)}</p>
                  }

                  if (part.type === 'tool-invocation') {
                    return <p className='bg-red-100'>TOOL CALL: {JSON.stringify(part.toolInvocation)}</p>
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

      <div className="p-2 border rounded-xl flex flex-col gap-2 shadow-xs">

        {contextItems.length > 0 && <div className="flex flex-wrap gap-1 p-2 -mx-2 -mt-2 border-b">
          {/* {JSON.stringify(contextItems)} */}
          {contextItems.map((item, index) => 
            <div key={index} className="flex flex-row items-center gap-1 border rounded py-1 px-1 bg-muted group">
              <Table className="size-3.5 group-hover:hidden" />
              <X className="size-3.5 hidden group-hover:block" /> 
              <p className="text-xs">{item.attrs.label}</p>
            </div>
          )}
        </div>}

        <Editor 
          id={id}
          placeholder="Ask anything, use @ to mention"
          className="focus:outline-none min-h-12 text-sm"
          sendMessage={sendMessage}
          enabledTools={enabledTools}
        />
        <div className="flex flex-row gap-2">
          <div className="flex-1 h-6 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="size-6 p-0" variant="ghost">
                  <Paperclip className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Attach files
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="size-6 p-0" variant="ghost">
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
                      {/* <ChevronsUpDown className="size-3" /> */}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  Integrations
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList className="mask-y-from-95%">
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
                          <CommandShortcut className='flex flex-row items-center'>
                            <Switch checked={enabledTools.includes(tool.id)} className="data-[state=checked]:bg-green-600"/>
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                      <CommandSeparator />
                    <CommandGroup heading="Integrations">
                      {mcpServers.map((mcp) => (
                        <CommandItem
                          key={mcp.name}
                          value={mcp.name}
                          onSelect={() => {
                            setEnabledTools(prev => 
                            prev.includes(mcp.name) 
                              ? prev.filter(id => id !== mcp.name)
                              : [...prev, mcp.name]
                            )
                            handleConnectMCP(mcp)
                          }}
                        >
                          <Avatar className='size-4 rounded-xs'>
                            <AvatarImage src={`/svg/${mcp.name.toLowerCase()}.svg`} />
                            <Wrench className="size-4" />
                          </Avatar>
                          <span>{mcp.name}</span>
                          <CommandShortcut className='flex flex-row items-center'>
                            {loadingMCPs.includes(mcp.name) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : configuredMCPs.includes(mcp.name) ? (
                              <Switch checked={enabledMCPs.includes(mcp.name)} className="data-[state=checked]:bg-green-600" />
                            ) : (
                              <ArrowRight className="size-4" />
                            )}
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover open={isPopoverOpen} onOpenChange={(state) => {
              setIsPopoverOpen(state)
              if (state === true) setIsModelSettingsOpen(false);
            }}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-6 px-1 text-xs font-medium flex items-center gap-1">
                    <img 
                      src={selectedModel.iconUrl} 
                      alt={selectedModel.label}
                      className="size-4 dark:invert dark:grayscale"
                    />
                    <ChevronsUpDown className="size-3" />
                  </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  Switch models
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup heading="Models" className={isModelSettingsOpen ? 'hidden' : ''}>
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
                          <img 
                            src={modelOption.iconUrl} 
                            alt={modelOption.label}
                            className="size-4 dark:invert dark:grayscale"
                          />
                          <span>{modelOption.label}</span>
                          <CommandShortcut>
                            {modelId === modelOption.id && <Check className="size-4" />}
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandGroup heading="System instructions" className={isModelSettingsOpen ? '' : 'hidden'}>
                      <CommandItem className="p-0.5">
                        <Textarea 
                          placeholder="Add custom instructions to personalize responses" 
                          className="resize-none p-1.5 text-xs focus-visible:ring-0 shadow-none" 
                          value={systemInstructions}
                          onChange={(e) => setSystemInstructions(e.target.value)}
                        />
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => setIsModelSettingsOpen(!isModelSettingsOpen)}>
                        {isModelSettingsOpen ? <ArrowLeft className="size-4" /> : <Settings className="size-4" />}
                        <span>{isModelSettingsOpen ? 'Models' : 'Settings'}</span>
                      </CommandItem>
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
              <Square className="size-3.5" />
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