import { createFileRoute, useRouter } from '@tanstack/react-router'
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from '@clerk/clerk-react';
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function AppPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const handleMakeApiRequest = async () => {
    const response = await api.public.$get({ query: { name: "John" } });
    console.log(await response.json());
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-2">
      <Button onClick={() => toast.success(JSON.stringify(import.meta.env, null, 2))}>
        Show Toast
      </Button>
      <Button onClick={handleMakeApiRequest}>
        Make API Request
      </Button>
      <Button onClick={() => router.navigate({ to: '/app/dashboard' })}>
        Go to Dashboard
      </Button>
      <Tooltip>
        <TooltipTrigger>
          <Button onClick={() => {console.log(userId)}}>
            Get user data
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Get user data
        </TooltipContent>
      </Tooltip>
      <Input />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: AppPage,
}) 