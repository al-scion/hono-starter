import { forwardRef } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Panel,
  useViewport,
  useReactFlow,
  PanelProps,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
 
export const ZoomSlider = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }) => {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut } = useReactFlow();
 
  return (
    <Panel
      className={cn(
        "flex rounded-md bg-background p-1 text-foreground border shadow-sm",
        className,
      )}
      position="bottom-left"
      {...props}
    >
      <Button
        variant="ghost"
        className="size-5 p-0"
        onClick={() => zoomOut({ duration: 300 })}
      >
        <Minus className="size-3" />
      </Button>
      <Button
        className="h-5 w-10 tabular-nums text-[10px] text-muted-foreground"
        variant="ghost"
        onClick={() => zoomTo(1, { duration: 300 })}
      >
        {Math.round(100 * zoom)}%
      </Button>
      <Button
        variant="ghost"
        className="size-5 p-0"
        onClick={() => zoomIn({ duration: 300 })}
      >
        <Plus className="size-3" />
      </Button>
    </Panel>
  );
});