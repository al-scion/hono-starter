import { createFileRoute, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: AppPage,
});

function AppPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <Button
        onClick={() => toast.success(JSON.stringify(import.meta.env, null, 2))}
      >
        Show Toast
      </Button>
      <Button onClick={() => router.navigate({ to: '/dashboard' })}>
        Go to Dashboard
      </Button>
    </div>
  );
}
