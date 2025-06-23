import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useStore } from "@/lib/state"

export function CustomMcpDialog() {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const { customMcpDialogOpen, setCustomMcpDialogOpen } = useStore()

  return (
    <Dialog open={customMcpDialogOpen} onOpenChange={setCustomMcpDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect MCP Server</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-y-4 mt-4">
          <div className="flex flex-col gap-y-2">
            <Label>Name</Label>
            <Input value={name} placeholder="My MCP Server" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>URL</Label>
            <Input value={url} placeholder="https://mcp.example.com" onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>API Key</Label>
            <Input value={apiKey} placeholder="Insert API Key" type="password" onChange={(e) => setApiKey(e.target.value)} />
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
  )
}