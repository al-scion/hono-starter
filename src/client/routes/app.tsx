import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function AppPage() {
  const handleMakeApiRequest = async () => {
    const response = await api.test.$get({ query: { name: "John" } });
    console.log(await response.json());
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-2">
      <Button onClick={() => toast.success("Hello from the app page!")}>
        Show Toast
      </Button>
      <Button onClick={handleMakeApiRequest}>
        Make API Request
      </Button>
    </div>
  );
}