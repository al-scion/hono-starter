import type * as React from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl bg-muted p-0.5',
        className
      )}
      data-slot="card"
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-row items-center px-2 py-1 min-h-8',
        className
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('border rounded-lg bg-background text-sm overflow-auto min-h-4 flex flex-col', className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center px-2 py-1', className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

function CardContentItem({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-row items-center gap-2 p-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors duration-200',
        className
      )}
      data-slot="card-content-item"
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardContentItem,
};
