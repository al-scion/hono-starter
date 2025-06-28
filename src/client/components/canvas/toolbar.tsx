import { useNodeOperations } from '@/components/canvas/node';
import { Panel, useReactFlow } from '@xyflow/react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AudioWaveformIcon, FileIcon, CodeIcon, ImageIcon, TextIcon } from 'lucide-react';

const nodeButtons = [
  {
    id: 'text',
    label: 'Text',
    icon: TextIcon,
    key: 'T'
  },
  {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
    key: 'I'
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: AudioWaveformIcon,
    key: 'A'
  },
  {
    id: 'code',
    label: 'Code',
    icon: CodeIcon,
    key: 'C',
    data: {
      content: { language: 'javascript' },
    },
  },
  {
    id: 'file',
    label: 'File',
    icon: FileIcon,
    key: 'F'
  },
];

export const ToolbarInner = () => {
  const { getViewport } = useReactFlow();
  const { addNode } = useNodeOperations();

  const handleAddNode = (type: string, options?: Record<string, unknown>) => {
    const viewport = getViewport();

    const centerX = -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
    const centerY = -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

    const position = { x: centerX, y: centerY };
    const { data: nodeData, ...rest } = options ?? {};

    addNode(type, {
      position,
      data: {
        ...(nodeData ? nodeData : {}),
      },
      ...rest,
    });
  };

  return (
    <Panel
      position="top-left"
      className='flex flex-col items-center rounded-lg border p-1 gap-1 bg-background shadow'
    >
      {nodeButtons.map((button) => (
        <Tooltip key={button.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className='size-9 p-0 relative'
              onClick={() => handleAddNode(button.id, button.data)}
            >
              <button.icon className='size-4 text-foreground' />
              <span className='absolute bottom-0 right-0.5 text-[8px] text-muted-foreground font-light'>
                {button.key}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='right'>{button.label}</TooltipContent>
        </Tooltip>
      ))}
    </Panel>
  );
};

export const Toolbar = memo(ToolbarInner);