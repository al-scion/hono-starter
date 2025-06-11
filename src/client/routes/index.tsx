import { createFileRoute, useRouter } from '@tanstack/react-router'
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from '@clerk/clerk-react';
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/custom/kbd";
import { UIMessage } from "@ai-sdk/react";

function AppPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const handleMakeApiRequest = async () => {
    const response = await api.public.$get({ query: { name: "John" } });
    console.log(await response.json());
  }

  const sendTestMessage = async () => {
    const response = await api.chat.stream.$post({
      json: {
        messages: [{ role: 'user', parts: [{ type: 'text', text: 'Hello, how are you?' }] }] as UIMessage[]
      }
    });
    console.log(await response.json());
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <Button onClick={() => toast.success(JSON.stringify(import.meta.env, null, 2))}>
        Show Toast
      </Button>
      <Button onClick={handleMakeApiRequest}>
        Make API Request
      </Button>
      <Button onClick={() => router.navigate({ to: '/app/dashboard' })}>
        Go to Dashboard
      </Button>
      <Button onClick={() => sendTestMessage()}>
        Send test message
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => {console.log(userId)}}>
            Get user data
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="outline">
          Get user data
          <Kbd keys="ctrl+p" />
        </TooltipContent>
      </Tooltip>
      <Input className="w-40" />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: AppPage,
}) 