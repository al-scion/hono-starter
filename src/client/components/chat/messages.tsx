import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/tiptap/editor";
import { MessageAssistant } from "@/components/tiptap/message-assistant";
import { MessageUser } from "@/components/tiptap/message-user";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUp, AtSign, Paperclip, Check, Globe, Lightbulb, ChevronsUpDown, Unplug, ChevronDown, Plus, History, Square, CodeXml } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandItem, CommandGroup, CommandShortcut } from "@/components/ui/command";
import { useLocalStorage } from "usehooks-ts";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/state";
import { DefaultChatTransport } from "ai";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const models = [{
  id: 'openai/gpt-4.1',
  label: 'GPT-4.1',
  iconUrl: '/svg/openai.svg'
}, {
  id: 'anthropic/claude-sonnet-4-20250514',
  label: 'Claude 4 Sonnet',
  iconUrl: '/svg/claude.svg'
}, {
  id: 'google/gemini-2.5-pro-exp-03-25',
  label: 'Gemini 2.5 Pro',
  iconUrl: '/svg/gemini.svg'
}, {
  id: 'google/gemini-2.5-flash-preview-05-20',
  label: 'Gemini 2.5 Flash',
  iconUrl: '/svg/gemini.svg'
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

export function Messages() {
  const [modelId, setModelId] = useLocalStorage('modelId', models[0].id);
  const selectedModel = models.find(m => m.id === modelId) || models[0];  

  const [enabledTools, setEnabledTools] = useLocalStorage<string[]>('enabledTools', ['web-search']);

  const { messages, status, sendMessage, setMessages, stop } = useChat({
    generateId: () => crypto.randomUUID(),
    transport: new DefaultChatTransport({
      api: '/api/chat/stream',
    }),
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);

  const { containerRef } = useScrollToBottom(messages);

  const { contextItems } = useStore();

  return (
    <div className="h-[calc(100vh-34px)] max-w-screen-sm mx-auto flex flex-col">

      <div className="flex flex-row items-center gap-2 mb-2">
        <Button variant="ghost" className="h-6 px-1 gap-1">
          New Chat
          <ChevronDown className="size-4" />
        </Button>
        <div className="flex flex-row gap-2 ml-auto">
          <Button variant="ghost" className="size-6 p-0" onClick={() => {setMessages([])}}>
            <Plus className="size-4" />
          </Button>
          <Button variant="ghost" className="size-6 p-0">
            <History className="size-4" />
          </Button>
        </div>

      </div>


      <div ref={containerRef} className="flex-1 overflow-y-auto py-4 px-2 space-y-3  text-sm">

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

            return <div key={message.id} className={`space-y-2 ${messageIndex === messages.length - 1 ? "min-h-[calc(100dvh-18rem)]" : ""}`}>

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
          <div className="min-h-[calc(100dvh-18rem)]">
            <span className="text-muted-foreground animate-pulse">Loading...</span>
          </div>
        )}
      </div>

      <div className="p-2 border rounded-xl flex flex-col gap-2">

        <div className="flex flex-row bg-muted px-2 py-1 -mx-2 -mt-2 rounded-t-xl">
          {JSON.stringify(contextItems)}
          {contextItems.map((item, index) => (
            <div key={index}>
              <p>{item.name}</p>
              <p>{item.description}</p>
            </div>
          ))}

        </div>

        <Editor 
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
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  Integrations
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0 w-50" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
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
                          <tool.icon className="size-4 text-muted-foreground" />
                          <span>{tool.label}</span>
                          <CommandShortcut className='flex flex-row items-center'>
                            <Switch checked={enabledTools.includes(tool.id)} />
                          </CommandShortcut>
                        </CommandItem>
                      ))}
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
                Select models
              </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0 w-50" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
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
                        <CommandShortcut className='flex flex-row items-center'>
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