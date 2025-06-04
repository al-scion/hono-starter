import { createFileRoute } from '@tanstack/react-router'
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function AppPage() {
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
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: AppPage,
}) 