import { Panel, type PanelProps, useReactFlow } from '@xyflow/react';
import { Fullscreen, Minus, Plus } from 'lucide-react';
import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ZoomSlider = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, 'children'>
>(({ className, ...props }, ref) => {
  const { zoomTo, zoomIn, zoomOut } = useReactFlow();

  return (
    <Panel
      className={cn(
        'flex rounded-md border bg-background p-0 text-foreground',
        className
      )}
      position="bottom-left"
      ref={ref}
      {...props}
    >
      <Button
        className="size-6 p-0"
        onClick={() => zoomOut({ duration: 300 })}
        variant="ghost"
      >
        <Minus className="size-4" />
      </Button>
      <Button
        className="size-6 p-0"
        onClick={() => zoomIn({ duration: 300 })}
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
      <Button
        className="size-6 p-0"
        onClick={() => zoomTo(1, { duration: 300 })}
        variant="ghost"
      >
        <Fullscreen className="size-4" />
      </Button>
    </Panel>
  );
});
