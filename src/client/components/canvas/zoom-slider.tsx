import { forwardRef } from "react";
import { Fullscreen, Minus, Plus } from "lucide-react";
import { Panel, useReactFlow, PanelProps } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
 
export const ZoomSlider = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }, ref) => {
  
  const { zoomTo, zoomIn, zoomOut } = useReactFlow();
 
  return (
    <Panel
      ref={ref}
      className={cn(
        "flex rounded-md bg-background p-0 text-foreground border",
        className,
      )}
      position="bottom-left"
      {...props}
    >
      <Button
        variant="ghost"
        className="size-6 p-0"
        onClick={() => zoomOut({ duration: 300 })}
      >
        <Minus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        className="size-6 p-0"
        onClick={() => zoomIn({ duration: 300 })}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        className="size-6 p-0"
        onClick={() => zoomTo(1, { duration: 300 })}
      >
        <Fullscreen className="size-4" />
      </Button>
    </Panel>
  );
});