import { createFileRoute, useParams } from '@tanstack/react-router';
import { z } from 'zod';
// import { Canvas } from '@/components/canvas/canvas';
import { Header } from '@/components/header/header';
import { Agent } from '@/components/agent/agent';
import { useAgent, useMutateModel } from '@/hooks/use-convex';
import { type Id } from '@/lib/api';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileText, Info, Loader2, Plus, Trash2, RotateCcw, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardContentItem } from '@/components/custom/custom-card';
import { Button } from '@/components/ui/button';
import prettyBytes from 'pretty-bytes';
import { useState } from 'react';
import { OpenAI, Claude, Google } from '@/lib/icons';
import { SlidersHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';
import { useSliderInput } from '@/hooks/use-slider-input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_layout/agent/$agentId')(
  {
    component: RouteComponent,
    validateSearch: z.object({
      mode: z.enum(['editor', 'canvas', 'logs', 'evaluation', 'deploy']),
    }),
    params: {
      parse: (params) => ({
        agentId: params.agentId as Id<'agents'>
      })
    }
  }
);

const tools = [{
  id: '1',
  name: 'Gmail',
  icon: 'https://www.google.com/gmail/about/static/images/logo-gmail.png',
  description: 'Send and receive emails',
  type: 'Utility',
}, {
  id: '2',
  name: 'Google Sheets',
  icon: 'https://www.google.com/gmail/about/static/images/logo-gmail.png',
  description: 'Send and receive emails',
  type: 'MCP',
}]

const dataSources = [{
  id: '1',
  name: 'Google Sheets',
  mimeType: 'PDF',
  size: 1230000,
  dateCreated: new Date(),
}, {
  id: '2',
  name: 'Google Sheets',
  mimeType: 'PDF',
  size: 1230000,
  dateCreated: new Date(),
}]

const models = [{
  id: 'openai/gpt-4.1',
  label: 'GPT-4.1',
  icon: OpenAI,
},{
  id: 'anthropic/claude-sonnet-4-20250514',
  label: 'Claude 4 Sonnet',
  icon: Claude,
},{
  id: 'google/gemini-2.5-pro-preview-06-05',
  label: 'Gemini 2.5 Pro',
  icon: Google,
},{
  id: 'google/gemini-2.5-flash-preview-05-20',
  label: 'Gemini 2.5 Flash',
  icon: Google,
}];

function RouteComponent() {
  
  const { agentId } = useParams({ from: '/_authenticated/_layout/agent/$agentId' });
  const { data: agent, isLoading: isLoadingAgent } = useAgent(agentId);
  const router = useRouter();

  // temporary states
  const { mutate: updateModel } = useMutateModel();
  const selectedModel = models.find((m) => m.id === agent?.model) || models[0];
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const maxIterationsMin = 1;
  const maxIterationsMax = 40;
  const maxIterations = useSliderInput({ 
    minValue: maxIterationsMin,
    maxValue: maxIterationsMax,
    initialValue: [20],
    defaultValue: [20],
  });


  if (isLoadingAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return router.navigate({ to: '/dashboard' });
  }

  return (
    <div className='h-full overflow-auto flex flex-col'>
      <Header className="sticky top-0" />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className='p-2 pr-1' minSize={25}>
          <Agent agent={agent} />
        </ResizablePanel>
        <ResizableHandle className='bg-background hover:bg-border hover:ring-[0.5px] hover:ring-border' />
        <ResizablePanel minSize={25}>
          <div className='p-2 pl-1 gap-2 flex flex-col overflow-auto h-full'>
            <Card>
              <CardHeader className='flex flex-row'>
                <Label>Config</Label>
                <Button variant='ghost' className='ml-auto size-6 p-0' onClick={() => setShowModelDetails(!showModelDetails)}>
                  <SlidersHorizontal className='size-4' />
                </Button>
              </CardHeader>
              <CardContent className='flex flex-col flex-1'>
                <CardContentItem className='border-none'>
                  <Label>Model</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='ml-auto h-8 px-2 justify-start'>
                        <selectedModel.icon className='size-4' />
                        <span className='font-normal'>{selectedModel.label}</span>
                        <ChevronsUpDown className='size-3 ml-auto' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      {models.map((modelOption) => (
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          key={modelOption.id}
                          onSelect={() => updateModel({ agentId: agent._id, model: modelOption.id })}
                        >
                          <modelOption.icon className="size-4" />
                          <span className='mr-3'>{modelOption.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContentItem>
                <div
                  className={cn(
                    'grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out',
                    showModelDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="min-h-0">
                    <CardContentItem className='border-t'>
                      <Label>Reasoning</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' className='ml-auto h-8 px-2 font-normal'>
                            <span>{reasoningEffort.charAt(0).toUpperCase() + reasoningEffort.slice(1)}</span>
                            <ChevronsUpDown className='size-3 ml-auto' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onSelect={() => setReasoningEffort('none')}>None</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setReasoningEffort('low')}>Low</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setReasoningEffort('medium')}>Medium</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setReasoningEffort('high')}>High</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContentItem>
                    <CardContentItem className='flex flex-row items-center p-2'>
                      <Label>Max iterations</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' className='ml-auto h-8 px-2 font-normal'>
                            <span>{parseFloat(maxIterations.inputValues[0])}</span>
                            <ChevronsUpDown className='size-3 ml-auto' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='p-2 gap-2 flex flex-row items-center'>
                          <Slider
                            className="w-40"
                            value={maxIterations.sliderValue}
                            onValueChange={maxIterations.handleSliderChange}
                            min={maxIterationsMin}
                            max={maxIterationsMax}
                            step={1}
                            aria-label="Slider with input"
                          />
                          <DropdownMenuItem asChild>
                            <Button variant='ghost' size='icon' onClick={() => maxIterations.resetToDefault()}>
                              <RotateCcw className='size-4' />
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContentItem>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Label>Tools</Label>
                <Info className='size-3 ml-1.5' />
                <Button variant='ghost' className='ml-auto size-6 p-0'>
                  <Plus className='size-4' />
                </Button>
              </CardHeader>
              <CardContent>
                {tools.map((tool) => (
                  <CardContentItem key={tool.id} className='grid grid-cols-[2fr_1fr] group/tool-item'>
                    <div className='flex flex-row items-center gap-2'>
                      <img src={tool.icon} className='size-9 p-1.5 border rounded-md shadow-xs' />
                      <div className='flex flex-col'>
                        <span>{tool.name}</span>
                        <span className='text-xs text-muted-foreground'>{tool.description}</span>
                      </div>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                      <div className='text-xs px-1 py-0.5 border rounded-md shadow-xs font-medium'>
                        {tool.type}
                      </div>
                      <div className='flex flex-row items-center gap-2 ml-auto'>
                        <Button variant='ghost' className='size-6 p-0 opacity-0 group-hover/tool-item:opacity-100' onClick={() => {}}>
                          <Pencil className='size-4' />
                        </Button>
                        <Button variant='ghost' className='size-6 p-0 opacity-0 group-hover/tool-item:opacity-100' onClick={() => {}}>
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContentItem>
                ))}
              </CardContent>
            </Card>


            <Card>
              <CardHeader className='flex flex-row'>
                <Label>Files</Label>
                <Button variant='ghost' className='ml-auto size-6 p-0'>
                  <Plus className='size-4' />
                </Button>
              </CardHeader>
              <CardContent className='flex flex-col'>
                {dataSources.map((dataSource) => (
                  <CardContentItem key={dataSource.id} className='grid grid-cols-[2fr_1fr] items-center gap-2 p-2 group/file-item'>
                    <div className='flex flex-row items-center gap-2'>
                      <FileText className='size-9 p-2 border rounded-md shadow-xs' />
                      <div className='flex flex-col'>
                        <span className=''>{dataSource.name}</span>
                        <span className='text-xs text-muted-foreground'>{dataSource.mimeType} • {prettyBytes(dataSource.size)}</span>
                      </div>
                    </div>

                    <div className='flex flex-row items-center gap-2'>
                      <span className='text-xs'>{dataSource.dateCreated.toLocaleDateString()}</span>
                      <Button variant='ghost' className='size-6 p-0 opacity-0 group-hover/file-item:opacity-100 ml-auto' onClick={() => {}}>
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  </CardContentItem>
                ))}
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
