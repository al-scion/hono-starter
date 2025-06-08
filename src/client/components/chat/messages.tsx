import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/tiptap/editor";
import { MessageAssistant } from "@/components/tiptap/message-assistant";
import { MessageUser } from "@/components/tiptap/message-user";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUp, AtSign, Paperclip, Check, Globe, Lightbulb, ChevronsUpDown, Unplug } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandItem, CommandGroup, CommandShortcut } from "@/components/ui/command";
import { useLocalStorage } from "usehooks-ts";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { Switch } from "@/components/ui/switch";

const models = [{
  id: 'openai/gpt-4.1',
  label: 'GPT-4.1',
  iconUrl: '/svg/openai.svg'
}, {
  id: 'anthropic/claude-3.5-sonnet',
  label: 'Claude 4 Sonnet',
  iconUrl: '/svg/claude.svg'
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
}]

export function Messages() {
  const { messages, input, status, append } = useChat({
    generateId: () => crypto.randomUUID(),
  });

  const [model, setModel] = useLocalStorage('model', 'openai/gpt-4.1');
  const selectedModel = models.find(m => m.id === model) || models[0];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [enabledTools, setEnabledTools] = useLocalStorage<string[]>('enabledTools', ['web-search']);
  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);

  const { containerRef } = useScrollToBottom(messages);


  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    setIsPopoverOpen(false);
  };

  const handleToolToggle = (toolId: string) => {
    setEnabledTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <div className="h-[calc(100vh-34px)] max-w-screen-sm mx-auto flex flex-col">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((message, messageIndex) => {
          const isLastAssistantMessage = message.role === 'assistant' && 
            messageIndex === messages.length - 1;
          
          return (
            <div key={message.id} className={isLastAssistantMessage ? "min-h-[calc(100dvh-14rem)]" : ""}>
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  if (message.role === 'assistant') {
                    return <MessageAssistant key={index} text={part.text} />;
                  }
                  return <MessageUser key={index} text={part.text} />;
                }
                return null;
              })}
            </div>
          );
        })}
        
        {/* Loading message while waiting for assistant response */}
        {status === 'submitted' && (
          <div className="min-h-[calc(100dvh-14rem)]">
            <span className="text-muted-foreground animate-pulse">Loading...</span>
          </div>
        )}
      </div>

      <div className="p-2 border rounded-xl flex flex-col gap-2">

        <Editor 
          value={input}
          disabled={status !== 'ready'}
          placeholder="Ask anything, use @ to mention"
          className="focus:outline-none min-h-12 text-sm"
          append={append}
        />
        <div className="flex flex-row gap-2">
          <div className="flex-1 h-6 flex items-center gap-1">
            <Button className="size-6 p-0" variant="ghost">
              <Paperclip className="size-4" />
            </Button>
            <Button className="size-6 p-0" variant="ghost">
              <AtSign className="size-4" />
            </Button>
            <Popover open={isToolPopoverOpen} onOpenChange={setIsToolPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-6 px-1 text-xs font-medium flex items-center gap-1">
                  <Unplug className="size-4" />
                  {/* <ChevronsUpDown className="size-3" /> */}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-50" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {tools.map((tool) => (
                        <CommandItem
                          key={tool.id}
                          value={tool.label}
                          onSelect={() => handleToolToggle(tool.id)}
                          className="flex items-center gap-2"
                        >
                          <tool.icon className="size-4 text-muted-foreground" />
                          <span>{tool.label}</span>
                          <CommandShortcut>
                            <Switch
                              checked={enabledTools.includes(tool.id)}
                              onCheckedChange={() => handleToolToggle(tool.id)}
                            />
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-6 px-1 text-xs font-medium flex items-center gap-1">
                  <img 
                    src={selectedModel.iconUrl} 
                    alt={selectedModel.label}
                    className="size-4"
                  />
                  <ChevronsUpDown className="size-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-50" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                    {models.map((modelOption) => (
                      <CommandItem
                        key={modelOption.id}
                        value={modelOption.label}
                        onSelect={() => handleModelSelect(modelOption.id)}
                        className="flex items-center gap-2"
                      >
                        <img 
                          src={modelOption.iconUrl} 
                          alt={modelOption.label}
                          className="size-4"
                        />
                        <span>{modelOption.label}</span>
                        {model === modelOption.id && <Check className="size-4 ml-auto" />}
                      </CommandItem>
                    ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button disabled={status !== 'ready' || !input} className="size-6 p-0 rounded-full">
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}