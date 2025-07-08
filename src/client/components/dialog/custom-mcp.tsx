import { useState } from 'react';
import { useStore } from '@/lib/state';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function CustomMcpDialog() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { customMcpDialogOpen, setCustomMcpDialogOpen } = useStore();

  return (
    <Dialog onOpenChange={setCustomMcpDialogOpen} open={customMcpDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect MCP Server</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label>Name</Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="My MCP Server"
              value={name}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>URL</Label>
            <Input
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://mcp.example.com"
              value={url}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>API Key</Label>
            <Input
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Insert API Key"
              type="password"
              value={apiKey}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button>Connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
