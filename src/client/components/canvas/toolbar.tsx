import { Panel, useReactFlow } from '@xyflow/react';
import {
  AudioWaveformIcon,
  CodeIcon,
  FileIcon,
  ImageIcon,
  TextIcon,
} from 'lucide-react';
import { memo } from 'react';
import { useNodeOperations } from '@/components/canvas/node';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const nodeButtons = [
  {
    id: 'text',
    label: 'Text',
    icon: TextIcon,
    key: 'T',
  },
  {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
    key: 'I',
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: AudioWaveformIcon,
    key: 'A',
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
    key: 'F',
  },
];

export const ToolbarInner = () => {
  const { getViewport } = useReactFlow();
  const { addNode } = useNodeOperations();

  const handleAddNode = (type: string, options?: Record<string, unknown>) => {
    const viewport = getViewport();

    const centerX =
      -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
    const centerY =
      -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

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
      className="flex flex-col items-center gap-1 rounded-lg border bg-background p-1 shadow"
      position="top-left"
    >
      {nodeButtons.map((button) => (
        <Tooltip key={button.id}>
          <TooltipTrigger asChild>
            <Button
              className="relative size-9 p-0"
              onClick={() => handleAddNode(button.id, button.data)}
              variant="ghost"
            >
              <button.icon className="size-4 text-foreground" />
              <span className="absolute right-0.5 bottom-0 font-light text-[8px] text-muted-foreground">
                {button.key}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{button.label}</TooltipContent>
        </Tooltip>
      ))}
    </Panel>
  );
};

export const Toolbar = memo(ToolbarInner);
