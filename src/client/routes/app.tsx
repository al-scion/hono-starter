import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AppPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={() => toast("Hello from the app page!")}>
        Show Toast
      </Button>
    </div>
  );
}