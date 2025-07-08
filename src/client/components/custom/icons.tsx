import type { LucideProps } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

export const Icon = ({
  name,
  className,
  ...props
}: { name: string } & Omit<LucideProps, 'ref'>) => {
  const IconComponent =
    name in LucideIcons
      ? ((LucideIcons as any)[name] as React.ComponentType<LucideProps>)
      : undefined;

  if (!IconComponent) {
    throw new Error(`Icon "${name}" not found`);
  }

  return <IconComponent className={cn('shrink-0', className)} {...props} />;
};
