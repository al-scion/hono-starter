import { useStore } from '@/lib/state';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

export function CustomMcpDialog() {
  
  const { customMcpDialogOpen, setCustomMcpDialogOpen } = useStore();
  const form = useForm({
    defaultValues: {
      name: '',
      url: '',
      apiKey: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
    validators: {
      onChange: z.object({
        name: z.string().min(1, 'Name is required'),
        url: z.string().min(1, 'URL is required').url('Please enter a valid URL'),
        apiKey: z.string(),
      })
    }
  })


  return (
    <Dialog onOpenChange={setCustomMcpDialogOpen} open={customMcpDialogOpen}>
      <DialogContent className='gap-6'>
        <DialogHeader>
          <DialogTitle>Connect MCP Server</DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>

        <form onSubmit={(e) => {e.preventDefault();e.stopPropagation();form.handleSubmit()}}>
          <div className="flex flex-col gap-y-4">
            <form.Field
              name="name"
              children={(field) => (
                <div className="flex flex-col gap-y-2">
                  <Label className='ml-0.5'>Name</Label>
                  <Input
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="My MCP Server"
                    value={field.state.value}
                  />
                </div>
              )}
            />
            <form.Field
              name="url"
              children={(field) => (
                <div className="flex flex-col gap-y-2">
                  <Label className='ml-0.5'>URL</Label>
                  <Input
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://mcp.example.com"
                    value={field.state.value}
                  />
                </div>
              )}
            />
            <form.Field
              name="apiKey"
              children={(field) => (
                <div className="flex flex-col gap-y-2">
                  <Label className='ml-0.5'>API Key</Label>
                  <Input
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Insert API Key"
                    type="password"
                    value={field.state.value}
                  />
                </div>
              )}
            />
          </div>
          <DialogFooter className='mt-6'>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
