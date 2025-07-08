import { Loader2 } from 'lucide-react';

export function LoadingPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  );
}
