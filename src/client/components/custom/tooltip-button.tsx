import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

interface TooltipButtonProps 
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: React.ReactNode;
  tooltip?: string;
}

export function TooltipButton({children, tooltip, ...props}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props}>{children}</Button>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent>
          {tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  )
}